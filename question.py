#!/usr/bin/env python3
from rag_pipeline.question_service import (
    generate_answer,
    get_available_configs,
    retrieve_documents,
)


def main() -> None:
    print("\n=== Which method do you want to use? ===")
    print("1) faiss   (semantic search)")
    print("2) bm25    (keyword search)")
    print("3) hybrid  (semantic + keyword, recommended)")
    method = input("\nSelect (1/2/3) [default: 3]: ").strip() or "3"

    method_map = {"1": "faiss", "2": "bm25", "3": "hybrid"}
    retriever = method_map.get(method, "hybrid")

    print("\n=== Which answer language do you want? ===")
    print("1) English")
    print("2) Korean")
    language_choice = input("\nSelect (1/2) [default: 1]: ").strip() or "1"
    language_map = {"1": "English", "2": "Korean"}
    answer_language = language_map.get(language_choice, "English")

    print("\n=== Which chunk mode/size? ===")
    configs = get_available_configs()
    if not configs:
        print("No available chunk/index configs found.")
        raise SystemExit(1)

    for i, config in enumerate(configs, 1):
        print(f"{i}) {config['label']}")

    default_idx = next((i for i, c in enumerate(configs, 1) if c["label"] == "structure_text_512"), 1)
    config_idx = input(f"\nSelect (1-{len(configs)}) [default: {default_idx}]: ").strip()
    config_idx = int(config_idx) - 1 if config_idx else default_idx - 1
    selected_config = configs[config_idx]

    print(f"\n→ Using: {retriever} + {selected_config['label']}")
    print(f"→ Answer language: {answer_language}")

    print("\n=== Write your question ===")
    query = input("> ").strip()
    if not query:
        print("No question provided.")
        raise SystemExit(1)

    result = retrieve_documents(
        query=query,
        retriever_name=retriever,
        selected_config=selected_config,
        top_k=5,
    )

    print(f"→ Chunks: {result['chunks_path']}")
    print(f"→ Index: {result['index_path']}")

    print("\n" + "=" * 80)
    print(f"📌 Query: {query}")
    print(f"📊 Method: {retriever} | Chunks: {selected_config['label']}")
    print("=" * 80)
    for i, doc in enumerate(result["docs"], 1):
        src = doc.get("source_file", "?")
        text = doc.get("text", "").replace("\n", " ")[:150]
        print(f"\n[{i}] {src}")
        print(f"    {text}...")
    print("\n" + "=" * 80)

    print("\n\n🤖 Generating answer from LG AI EXAONE...\n")
    answer = generate_answer(
        query=query,
        docs=result["docs"],
        answer_language=answer_language,
    )
    print("\n" + "=" * 80)
    print("✨ FINAL ANSWER")
    print("=" * 80)
    print(answer)
    print("=" * 80)


if __name__ == "__main__":
    main()
