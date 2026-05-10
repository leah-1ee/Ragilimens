"""
Harry Potter RAG System - Main Execution Module
Professional Edition for Seminar
"""
import json
import argparse
import time
from rag_pipeline.query_service import (
    generate_answer,
    list_available_configs,
    retrieve_documents,
)

def print_boxed_response(text):
    """답변 내용을 깔끔한 테두리 박스에 담아 출력합니다."""
    lines = text.split('\n')
    # 터미널 너비에 맞춰 유동적으로 조절 (최대 80자)
    max_len = max(len(line) for line in lines) if lines else 0
    width = min(max_len, 80)
    
    border = "+" + "-" * (width + 4) + "+"
    print("\n" + border)
    print("| " + "FINAL AI RESPONSE".center(width + 2) + " |")
    print(border)
    for line in lines:
        if len(line) > width:
            line = line[:width - 3] + "..."
        print(f"|  {line.ljust(width)}  |")
    print(border + "\n")

def positive_int(value):
    ivalue = int(value)
    if ivalue < 1:
        raise argparse.ArgumentTypeError(f"--k must be >= 1, got {ivalue}")
    return ivalue


def main():
    parser = argparse.ArgumentParser(description="Harry Potter RAG System")
    parser.add_argument("--query", type=str, default="Tell me about Harry Potter", help="User Query")
    parser.add_argument("--filter", type=str, default=None, help="Metadata Filter (JSON)")
    parser.add_argument("--k", type=positive_int, default=3, help="Number of chunks to retrieve")
    parser.add_argument("--chunks-path", type=str, default=None, help="Chunk metadata JSON path")
    parser.add_argument("--index-path", type=str, default=None, help="FAISS index path")
    parser.add_argument(
        "--list-configs",
        action="store_true",
        help="List discovered text chunk/index configs and exit",
    )
    args = parser.parse_args()

    if args.list_configs:
        configs = list_available_configs()
        if not configs:
            print("[INFO] No text configs discovered in data/text/processed")
            return
        for config in configs:
            print(
                f"{config['label']}: chunks={config['chunks_path']} "
                f"index={config['index_path']} [ready]"
            )
        return

    print("[INFO] Initializing RAG System Components...")
    metadata_filter = None
    if args.filter:
        try:
            metadata_filter = json.loads(args.filter)
        except json.JSONDecodeError:
            print(f"[WARN] Invalid filter format: {args.filter}")

    selected_config = None
    if args.chunks_path and args.index_path:
        selected_config = {
            "label": "custom",
            "chunks_path": args.chunks_path,
            "index_path": args.index_path,
        }

    print(f"[QUERY] {args.query}")
    print("[PROCESS] Searching for relevant document chunks (Hybrid Search: BM25 + Vector)...")

    start_search = time.perf_counter()
    try:
        result = retrieve_documents(
            query=args.query,
            retriever_name="hybrid",
            selected_config=selected_config,
            top_k=args.k,
            metadata_filter=metadata_filter,
        )
    except FileNotFoundError as exc:
        print(f"[ERROR] {exc}")
        return
    end_search = time.perf_counter()

    print(f"[INFO] Chunks Path: {result['chunks_path']}")
    print(f"[INFO] Index Path: {result['index_path']}")
    print(f"[INFO] Database: {len(result['docs'])} chunks retrieved")
    if metadata_filter:
        print(f"[INFO] Metadata Filter Applied: {metadata_filter}")
    print()

    # 2. 검색 결과 리포트
    print("-" * 60)
    print(f"[DEBUG] Hybrid Retrieval completed in {end_search - start_search:.4f}s")
    print("-" * 60)

    for i, doc in enumerate(result["docs"], 1):
        source = doc.get('source_file', 'Unknown')
        print(f"[{i}] Source: {source}")
        print(f"    Preview: {doc.get('text', '')[:150]}...")

    # 3. 답변 생성 단계 (Generation)
    print("\n" + "=" * 60)
    print("  GENERATING RESPONSE VIA LOCAL LLM (EXAONE 3.5)")
    print("=" * 60)

    start_generation = time.perf_counter()
    answer = generate_answer(
        query=args.query,
        docs=result["docs"],
        answer_language="English",
    )
    end_generation = time.perf_counter()

    print("-" * 60)
    print(f"[DEBUG] Generation completed in {end_generation - start_generation:.4f}s")
    print("-" * 60)
    
    # 4. 박스 테두리 답변 출력
    print_boxed_response(answer)
    
    # 5. 출처 리스트 출력
    print("=" * 60)
    print("  REFERENCE LIST")
    print("=" * 60)
    sources = []
    for doc in result["docs"]:
        info = doc.get('source_file', 'unknown')
        if info not in sources:
            sources.append(info)
    
    for i, source in enumerate(sources, 1):
        print(f"  {i}. {source}")
    print("=" * 60 + "\n")

if __name__ == "__main__":
    main()
