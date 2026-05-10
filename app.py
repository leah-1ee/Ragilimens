import streamlit as st
from rag_pipeline.query_service import (
    list_available_configs,
    retrieve_documents,
    generate_answer,
)

# ── 페이지 기본 설정 ──────────────────────────────────────────
st.set_page_config(
    page_title="Ragilimens — Harry Potter RAG",
    page_icon="🔮",
    layout="wide",
)

# ── 사이드바: 검색 설정 ───────────────────────────────────────
with st.sidebar:
    st.title("⚙️ 설정")

    retriever = st.radio(
        "검색 방식",
        options=["hybrid", "faiss", "bm25"],
        index=0,
        help="hybrid = BM25 + FAISS 혼합 (권장)",
    )

    answer_language = st.radio(
        "답변 언어",
        options=["English", "Korean"],
        index=0,
    )

    top_k = st.slider("검색할 청크 수 (top-k)", min_value=1, max_value=10, value=3)

    # 사용 가능한 chunk/index 설정 목록 불러오기
    configs = list_available_configs()
    if configs:
        config_labels = [c["label"] for c in configs]
        selected_label = st.selectbox("청크 설정", config_labels)
        selected_config = next(c for c in configs if c["label"] == selected_label)
    else:
        st.error("❌ 청크/인덱스 파일이 없습니다.\n\nchunk_dataset.py → build_index.py 를 먼저 실행하세요.")
        selected_config = None

    st.divider()
    st.caption("Ragilimens · Harry Potter RAG System")

# ── 메인 화면 ─────────────────────────────────────────────────
st.title("🔮 Ragilimens")
st.caption("Harry Potter 텍스트 기반 질의응답 시스템")

query = st.text_input(
    "질문을 입력하세요",
    placeholder="예: Who is Dudley? / What is the Sorting Hat?",
)

run = st.button("검색 + 답변 생성", type="primary", disabled=(selected_config is None))

if run and query.strip():
    # ── 검색 단계 ──────────────────────────────────────────────
    with st.spinner("관련 문서 검색 중..."):
        try:
            result = retrieve_documents(
                query=query,
                retriever_name=retriever,
                selected_config=selected_config,
                top_k=top_k,
            )
        except FileNotFoundError as e:
            st.error(f"인덱스 파일을 찾을 수 없습니다: {e}")
            st.stop()

    docs = result["docs"]

    # ── 검색 결과 표시 ─────────────────────────────────────────
    st.subheader("📄 검색된 문서 청크")
    for i, doc in enumerate(docs, 1):
        with st.expander(f"[{i}] {doc.get('source_file', '알 수 없음')}"):
            st.write(doc.get("text", ""))

    # ── 답변 생성 단계 ─────────────────────────────────────────
    st.subheader("💬 AI 답변")
    with st.spinner("EXAONE으로 답변 생성 중... (첫 실행은 오래 걸릴 수 있습니다)"):
        answer = generate_answer(
            query=query,
            docs=docs,
            answer_language=answer_language,
        )

    st.success(answer)

    # ── 참고 출처 ──────────────────────────────────────────────
    sources = list(dict.fromkeys(doc.get("source_file", "unknown") for doc in docs))
    st.caption("📚 참고 출처: " + ", ".join(sources))

elif run and not query.strip():
    st.warning("질문을 입력해주세요.")