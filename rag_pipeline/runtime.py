import glob
import json
import os
import re
import warnings
from typing import Any, Dict, List, Optional

import faiss
from langchain_community.docstore.in_memory import InMemoryDocstore
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document

try:
    from langchain_huggingface import HuggingFaceEmbeddings
except ImportError:
    from langchain_core._api.deprecation import LangChainDeprecationWarning
    from langchain_community.embeddings import HuggingFaceEmbeddings

    warnings.filterwarnings(
        "ignore",
        category=LangChainDeprecationWarning,
        message=r".*HuggingFaceEmbeddings.*deprecated.*",
    )

from config import EMBEDDING_MODEL, FAISS_INDEX_PATH


DEFAULT_TEXT_CHUNKS_PATH = "data/text/processed/chunks_structure_text_512_metadata.json"
DEFAULT_TEXT_INDEX_PATH = "vector_db/faiss_text_structure_text_512.index"
LEGACY_CHUNKS_PATH = "data/processed/chunks_metadata.json"


def _path_exists(path: str) -> bool:
    return bool(path) and os.path.exists(path)


def discover_text_configs() -> List[Dict[str, Any]]:
    pattern = os.path.join("data", "text", "processed", "chunks_*_metadata.json")
    configs: List[Dict[str, Any]] = []

    for chunks_path in sorted(glob.glob(pattern)):
        name = os.path.basename(chunks_path)
        match = re.match(r"chunks_(.+)_(\d+)_metadata\.json$", name)
        if not match:
            continue

        mode, size = match.groups()
        index_path = f"vector_db/faiss_text_{mode}_{size}.index"
        configs.append(
            {
                "label": f"{mode}_{size}",
                "mode": mode,
                "size": int(size),
                "chunks_path": chunks_path,
                "index_path": index_path,
                "available": _path_exists(index_path),
            }
        )

    return configs


def choose_default_artifacts(
    chunks_path: Optional[str] = None,
    index_path: Optional[str] = None,
) -> tuple[str, str]:
    if chunks_path and index_path:
        return chunks_path, index_path

    if chunks_path and not index_path:
        raise FileNotFoundError("index_path must be provided when chunks_path is set.")

    if index_path and not chunks_path:
        raise FileNotFoundError("chunks_path must be provided when index_path is set.")

    preferred_pairs = [
        (DEFAULT_TEXT_CHUNKS_PATH, DEFAULT_TEXT_INDEX_PATH),
        (LEGACY_CHUNKS_PATH, FAISS_INDEX_PATH),
        ("data/processed/chunks.json", FAISS_INDEX_PATH),
    ]
    for candidate_chunks, candidate_index in preferred_pairs:
        if _path_exists(candidate_chunks) and _path_exists(candidate_index):
            return candidate_chunks, candidate_index

    for config in discover_text_configs():
        if config["available"]:
            return config["chunks_path"], config["index_path"]

    raise FileNotFoundError(
        "No matching chunk metadata JSON and FAISS index were found. "
        "Run chunking/indexing first or pass --chunks-path and --index-path explicitly."
    )


def load_chunks_and_index(
    chunks_path: Optional[str] = None,
    index_path: Optional[str] = None,
) -> tuple[List[Dict[str, Any]], faiss.Index, str, str]:
    resolved_chunks_path, resolved_index_path = choose_default_artifacts(
        chunks_path=chunks_path,
        index_path=index_path,
    )

    with open(resolved_chunks_path, "r", encoding="utf-8") as f:
        chunks = json.load(f)

    index = faiss.read_index(resolved_index_path)
    return chunks, index, resolved_chunks_path, resolved_index_path


def chunk_to_document(chunk: Dict[str, Any]) -> Document:
    metadata = {key: value for key, value in chunk.items() if key != "text"}
    return Document(page_content=chunk.get("text", ""), metadata=metadata)


def build_documents(chunks: List[Dict[str, Any]]) -> List[Document]:
    return [chunk_to_document(chunk) for chunk in chunks]


def build_vectorstore(index: faiss.Index, documents: List[Document]) -> FAISS:
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
    index_to_docstore_id = {i: str(i) for i in range(len(documents))}
    docstore = InMemoryDocstore({str(i): doc for i, doc in enumerate(documents)})
    return FAISS(
        embedding_function=embeddings,
        index=index,
        docstore=docstore,
        index_to_docstore_id=index_to_docstore_id,
    )
