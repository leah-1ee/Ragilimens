def build_prompt(contexts, query, answer_language="English"):
    """
    Build a grounded user prompt from retrieved contexts.

    The chat wrapper is handled in rag_chain.py. This function only prepares
    the user-visible evidence block plus the question.
    """
    context_blocks = []
    for i, ctx in enumerate(contexts[:3], 1):
        text = (ctx or "").strip()
        if not text:
            continue
        context_blocks.append(f"[{i}] {text}")

    context_str = "\n\n".join(context_blocks) if context_blocks else "[No retrieved context]"

    return (
        f"Answer in {answer_language}.\n\n"
        "Use only the information in the context below. "
        "If the answer is not clearly supported by the context, say: "
        "'The provided documents do not contain the answer.'\n\n"
        f"Context:\n{context_str}\n\n"
        f"Question: {query}"
    )
