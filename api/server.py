import time
from threading import Lock, Thread
from typing import Any, Literal, Optional
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from rag_pipeline.query_service import (
    generate_answer,
    list_available_configs,
    retrieve_documents,
)


app = FastAPI(title="Harry Potter RAG API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RAGQueryRequest(BaseModel):
    query: str
    retriever_name: Literal["hybrid", "faiss", "bm25"] = "hybrid"
    answer_language: Literal["English", "Korean"] = "English"
    top_k: int = 3
    selected_config: str = "structure_text_512"
    metadata_filter: Optional[dict[str, Any]] = None


JOBS: dict[str, dict[str, Any]] = {}
JOBS_LOCK = Lock()


def find_selected_config(label: str) -> Optional[dict[str, Any]]:
    configs = list_available_configs()

    if not configs:
        return None

    for config in configs:
        if config.get("label") == label:
            return config

    return None


def validate_request(request: RAGQueryRequest) -> dict[str, Any]:
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="query is required")

    if request.top_k < 1:
        raise HTTPException(status_code=400, detail="top_k must be >= 1")

    selected_config = find_selected_config(request.selected_config)

    if selected_config is None:
        available_configs = list_available_configs()

        if not available_configs:
            raise HTTPException(
                status_code=500,
                detail=(
                    "No available chunk/index configs found. "
                    "Check data/text/processed and vector_db."
                ),
            )

        raise HTTPException(
            status_code=400,
            detail={
                "message": f"selected_config not found: {request.selected_config}",
                "available_configs": [
                    config.get("label") for config in available_configs
                ],
            },
        )

    return selected_config


def update_job(job_id: str, **values: Any) -> None:
    with JOBS_LOCK:
        if job_id in JOBS:
            JOBS[job_id].update(values)


def execute_rag_query(
    request: RAGQueryRequest,
    selected_config: dict[str, Any],
) -> dict[str, Any]:
    retrieval_start = time.perf_counter()

    retrieval_result = retrieve_documents(
        query=request.query,
        retriever_name=request.retriever_name,
        selected_config=selected_config,
        top_k=request.top_k,
        metadata_filter=request.metadata_filter,
    )

    retrieval_time = time.perf_counter() - retrieval_start
    docs = retrieval_result["docs"]

    generation_start = time.perf_counter()

    answer = generate_answer(
        query=request.query,
        docs=docs,
        answer_language=request.answer_language,
    )

    generation_time = time.perf_counter() - generation_start

    sources: list[str] = []

    for doc in docs:
        source = doc.get("source_file", "unknown")

        if source not in sources:
            sources.append(source)

    return {
        "query": request.query,
        "answer": answer,
        "retriever_name": request.retriever_name,
        "answer_language": request.answer_language,
        "top_k": request.top_k,
        "selected_config": selected_config.get(
            "label",
            request.selected_config,
        ),
        "chunks_path": retrieval_result.get("chunks_path", ""),
        "index_path": retrieval_result.get("index_path", ""),
        "retrieval_time": retrieval_time,
        "generation_time": generation_time,
        "docs": docs,
        "sources": sources,
    }


def run_rag_job(
    job_id: str,
    request: RAGQueryRequest,
    selected_config: dict[str, Any],
) -> None:
    try:
        update_job(
            job_id,
            status="retrieving",
            progress=35,
            message="Retrieving evidence from FAISS and BM25...",
        )

        retrieval_start = time.perf_counter()

        retrieval_result = retrieve_documents(
            query=request.query,
            retriever_name=request.retriever_name,
            selected_config=selected_config,
            top_k=request.top_k,
            metadata_filter=request.metadata_filter,
        )

        retrieval_time = time.perf_counter() - retrieval_start
        docs = retrieval_result["docs"]

        update_job(
            job_id,
            status="generating",
            progress=70,
            message="Generating a grounded answer with the local LLM...",
        )

        generation_start = time.perf_counter()

        answer = generate_answer(
            query=request.query,
            docs=docs,
            answer_language=request.answer_language,
        )

        generation_time = time.perf_counter() - generation_start

        sources: list[str] = []

        for doc in docs:
            source = doc.get("source_file", "unknown")

            if source not in sources:
                sources.append(source)

        result = {
            "query": request.query,
            "answer": answer,
            "retriever_name": request.retriever_name,
            "answer_language": request.answer_language,
            "top_k": request.top_k,
            "selected_config": selected_config.get(
                "label",
                request.selected_config,
            ),
            "chunks_path": retrieval_result.get("chunks_path", ""),
            "index_path": retrieval_result.get("index_path", ""),
            "retrieval_time": retrieval_time,
            "generation_time": generation_time,
            "docs": docs,
            "sources": sources,
        }

        update_job(
            job_id,
            status="completed",
            progress=100,
            message="Answer generated successfully.",
            result=result,
        )

    except Exception as exc:
        update_job(
            job_id,
            status="error",
            progress=100,
            message=str(exc),
            error=str(exc),
        )


@app.get("/")
def root():
    return {
        "message": "Harry Potter RAG API is running",
        "docs": "/docs",
        "health": "/api/rag/health",
        "configs": "/api/rag/configs",
    }


@app.get("/api/rag/health")
def health_check():
    return {
        "status": "ok",
        "message": "Harry Potter RAG API is running",
    }


@app.get("/api/rag/configs")
def get_configs():
    return {
        "configs": list_available_configs(),
    }


@app.post("/api/rag/query")
def query_rag(request: RAGQueryRequest):
    selected_config = validate_request(request)

    try:
        return execute_rag_query(request, selected_config)

    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/rag/jobs")
def create_rag_job(request: RAGQueryRequest):
    selected_config = validate_request(request)
    job_id = str(uuid4())

    with JOBS_LOCK:
        JOBS[job_id] = {
            "job_id": job_id,
            "status": "queued",
            "progress": 10,
            "message": "Query received by the RAG backend.",
            "result": None,
            "error": None,
        }

    Thread(
        target=run_rag_job,
        args=(job_id, request, selected_config),
        daemon=True,
    ).start()

    return {
        "job_id": job_id,
        "status": "queued",
        "progress": 10,
        "message": "Query received by the RAG backend.",
    }


@app.get("/api/rag/jobs/{job_id}")
def get_rag_job(job_id: str):
    with JOBS_LOCK:
        job = JOBS.get(job_id)

        if job is None:
            raise HTTPException(status_code=404, detail="job not found")

        return dict(job)
