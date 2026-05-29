import time
from typing import Any, Literal, Optional

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


def find_selected_config(label: str) -> Optional[dict[str, Any]]:
    configs = list_available_configs()

    if not configs:
        return None

    for config in configs:
        if config.get("label") == label:
            return config

    return None


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
                "available_configs": [config.get("label") for config in available_configs],
            },
        )

    try:
        retrieval_start = time.perf_counter()

        retrieval_result = retrieve_documents(
            query=request.query,
            retriever_name=request.retriever_name,
            selected_config=selected_config,
            top_k=request.top_k,
            metadata_filter=request.metadata_filter,
        )

        retrieval_end = time.perf_counter()

        docs = retrieval_result["docs"]

        generation_start = time.perf_counter()

        answer = generate_answer(
            query=request.query,
            docs=docs,
            answer_language=request.answer_language,
        )

        generation_end = time.perf_counter()

        sources = []
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
            "selected_config": selected_config.get("label", request.selected_config),
            "chunks_path": retrieval_result.get("chunks_path", ""),
            "index_path": retrieval_result.get("index_path", ""),
            "retrieval_time": retrieval_end - retrieval_start,
            "generation_time": generation_end - generation_start,
            "docs": docs,
            "sources": sources,
        }

    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
