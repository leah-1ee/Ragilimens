from functools import lru_cache
from typing import Any, Dict, List, Optional

from langchain_core.documents import Document
from rank_bm25 import BM25Okapi

from ingest.embed import model
from rag_pipeline.hybrid_retriever import HybridRetriever
from rag_pipeline.runtime import (
    build_documents,
    build_vectorstore,
    discover_text_configs,
    load_chunks_and_index,
)


RetrieverName = str


def list_available_configs() -> List[Dict[str, Any]]:
    return [config for config in discover_text_configs() if config["available"]]


def get_default_config(configs: Optional[List[Dict[str, Any]]] = None) -> Optional[Dict[str, Any]]:
    configs = configs or list_available_configs()
    if not configs:
        return None

    for config in configs:
        if config["label"] == "structure_text_512":
            return config
    return configs[0]


@lru_cache(maxsize=4)
def _load_chunks_index_bundle(chunks_path: str, index_path: str) -> tuple[List[Dict[str, Any]], Any, str, str]:
    return load_chunks_and_index(chunks_path=chunks_path, index_path=index_path)


@lru_cache(maxsize=4)
def _build_runtime_bundle(chunks_path: str, index_path: str) -> Dict[str, Any]:
    chunks, index, resolved_chunks_path, resolved_index_path = _load_chunks_index_bundle(
        chunks_path,
        index_path,
    )
    documents = build_documents(chunks)
    vectorstore = build_vectorstore(index, documents)
    return {
        "chunks": chunks,
        "index": index,
        "chunks_path": resolved_chunks_path,
        "index_path": resolved_index_path,
        "documents": documents,
        "vectorstore": vectorstore,
    }


@lru_cache(maxsize=4)
def _build_bm25(chunks_path: str, index_path: str) -> BM25Okapi:
    chunks, _, _, _ = _load_chunks_index_bundle(chunks_path, index_path)
    tokenized = [chunk.get("text", "").split() for chunk in chunks]
    return BM25Okapi(tokenized)


def _document_to_chunk(doc: Document) -> Dict[str, Any]:
    return {
        "text": doc.page_content,
        **doc.metadata,
    }


def retrieve_documents(
    query: str,
    retriever_name: RetrieverName = "hybrid",
    selected_config: Optional[Dict[str, Any]] = None,
    top_k: int = 5,
    metadata_filter: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    if not query.strip():
        raise ValueError("query must not be empty")

    config = selected_config or get_default_config()
    if config is None:
        raise FileNotFoundError("No available chunk/index configs found.")

    runtime_bundle = _build_runtime_bundle(
        config["chunks_path"],
        config["index_path"],
    )
    chunks = runtime_bundle["chunks"]
    index = runtime_bundle["index"]
    chunks_path = runtime_bundle["chunks_path"]
    index_path = runtime_bundle["index_path"]

    bm25 = None
    if retriever_name in {"bm25", "hybrid"}:
        bm25 = _build_bm25(chunks_path, index_path)

    if retriever_name == "hybrid":
        hybrid_retriever = HybridRetriever(
            vectorstore=runtime_bundle["vectorstore"],
            docs=runtime_bundle["documents"],
            k=60,
            top_k=top_k,
        )
        retrieved_docs = hybrid_retriever.invoke(query, metadata_filter=metadata_filter)
        docs = [_document_to_chunk(doc) for doc in retrieved_docs]
    elif retriever_name == "faiss":
        q_vec = model.encode([query])
        ids = index.search(q_vec, min(top_k * 10, len(chunks)))[1][0]
        docs = [chunks[i] for i in ids if i >= 0][:top_k]
    elif retriever_name == "bm25":
        if bm25 is None:
            raise RuntimeError("BM25 index was not initialized.")
        scores = bm25.get_scores(query.split())
        ranked = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)
        docs = [chunks[i] for i in ranked[:top_k]]
    else:
        raise ValueError(f"Unsupported retriever: {retriever_name}")

    return {
        "query": query,
        "retriever": retriever_name,
        "config": config,
        "chunks_path": chunks_path,
        "index_path": index_path,
        "docs": docs,
        "metadata_filter": metadata_filter,
    }


def generate_answer(
    query: str,
    docs: List[Dict[str, Any]],
    answer_language: str = "English",
) -> str:
    from rag_pipeline.prompt import build_prompt
    from rag_pipeline.rag_chain import rag_answer

    contexts = [doc.get("text", "") for doc in docs]
    prompt = build_prompt(contexts, query, answer_language=answer_language)
    return rag_answer(prompt, answer_language=answer_language)


def run_query_session(
    query: str,
    retriever_name: RetrieverName = "hybrid",
    answer_language: str = "English",
    selected_config: Optional[Dict[str, Any]] = None,
    top_k: int = 5,
    metadata_filter: Optional[Dict[str, Any]] = None,
    with_answer: bool = True,
) -> Dict[str, Any]:
    result = retrieve_documents(
        query=query,
        retriever_name=retriever_name,
        selected_config=selected_config,
        top_k=top_k,
        metadata_filter=metadata_filter,
    )

    answer = None
    if with_answer:
        answer = generate_answer(
            query=query,
            docs=result["docs"],
            answer_language=answer_language,
        )

    return {
        **result,
        "answer_language": answer_language,
        "answer": answer,
    }
