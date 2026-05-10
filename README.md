# 오픈소스SW기초 - Ragilimens 팀 프로젝트 

# Structure-Aware Hybrid RAG

Harry Potter 텍스트 데이터를 대상으로 구조 인식 청킹, 하이브리드 검색, grounded generation을 실험하는 Python 기반 RAG 프로젝트입니다.

이 프로젝트는 단순히 LLM에 질문을 던지는 것이 아니라,
1. 문서를 의미 단위로 나누고
2. 관련 청크를 검색한 뒤
3. 검색된 근거만 사용해 답변을 생성하는
RAG 파이프라인을 연구/검증하는 데 목적이 있습니다.

## 이 프로젝트가 다루는 데이터
- 기본 대상: Harry Potter 텍스트 데이터
- 현재 기본 실행 경로에서 사용하는 산출물:
  - `data/text/processed/chunks_structure_text_512_metadata.json`
  - `vector_db/faiss_text_structure_text_512.index`
- `data/raw/` 안에는 책 텍스트, 보조 로어 텍스트가 포함될 수 있습니다.

현재 기본 파이프라인은 `structure_text` 청킹 + `512` 크기 설정을 중심으로 사용합니다.

## 핵심 목표
- `structure_text` 청킹으로 문맥 단절 줄이기
- FAISS + BM25 + RRF 기반 hybrid retrieval 품질 개선
- EXAONE 기반 grounded answer generation
- CLI, 프론트/API, 평가 스크립트가 같은 query service를 재사용하도록 구조 통일

## 현재 권장 실행 흐름
1. raw 데이터 준비
2. 청킹
3. 인덱스 생성
4. 질의 실행
5. retrieval / generation 품질 평가

## 엔트리포인트
- `main.py`
  - 비대화형 CLI
  - 자동 실행, 스크립트 호출, 백엔드/API 연동에 적합
- `question.py`
  - 대화형 CLI
  - 사용자가 터미널에서 retrieval 결과와 answer를 빠르게 검증하기 적합

두 엔트리포인트는 역할은 다르지만, 현재 기본 `hybrid` 경로에서는 같은 `rag_pipeline/query_service.py` 를 사용합니다.

## 현재 아키텍처
- `rag_pipeline/query_service.py`
  - 공용 query 실행 코어
  - `main.py`와 `question.py`가 함께 사용하는 서비스 레이어
- `rag_pipeline/hybrid_retriever.py`
  - BM25 + FAISS + RRF + source diversity 보강
- `rag_pipeline/prompt.py`
  - grounded prompt 구성
- `rag_pipeline/rag_chain.py`
  - EXAONE 로딩 및 answer generation
- `scripts/`
  - 청킹, 인덱싱, 평가 스크립트
  - 현재 저장소에 포함된 스크립트: `chunk_dataset.py`, `build_index.py`, `eval_retrieval.py`, `eval_detailed_report.py`, `inject_metadata.py`, `chunk_papers.py`

## 빠른 시작
```bash
python3 -m pip install -r requirements.txt

python3 scripts/chunk_dataset.py \
  --mode structure_text \
  --chunk-size 512 \
  --output data/text/processed/chunks_structure_text_512.json

python3 scripts/build_index.py \
  --chunks-path data/text/processed/chunks_structure_text_512.json \
  --index-path vector_db/faiss_text_structure_text_512.index \
  --metadata-path data/text/processed/chunks_structure_text_512_metadata.json

python3 main.py --query "Who is Dudley?" --k 3
```

대화형 검증:
```bash
python3 question.py
```

## 사용법
### `main.py`
자동 실행용 CLI입니다. 스크립트 호출, 백엔드 테스트, 비대화형 실행에 적합합니다.

예시:
```bash
python3 main.py --query "Who is Dudley?" --k 3
python3 main.py --query "Who is Harry Potter?" --k 5
python3 main.py --list-configs
```

주요 옵션:
- `--query`: 사용자 질문
- `--k`: retrieval top-k (1 이상의 정수)
- `--filter`: 메타데이터 필터(JSON 문자열)
- `--chunks-path`, `--index-path`: 사용자 지정 산출물 경로
- `--list-configs`: 현재 사용 가능한 chunk/index 조합 출력

### `question.py`
대화형 검증용 CLI입니다. 검색 방식, 답변 언어, chunk 설정을 순서대로 선택한 뒤 질문을 입력합니다.

예시:
```bash
python3 question.py
```

추천 용도:
- retrieval 결과를 눈으로 빠르게 확인하고 싶을 때
- `faiss` / `bm25` / `hybrid`를 비교 실험하고 싶을 때
- 프론트로 옮기기 전에 사용자 흐름을 터미널에서 검증하고 싶을 때

### `query_service.py`
현재 공용 query 실행 코어입니다. 웹/API 레이어에서는 이 모듈을 직접 재사용하는 것이 권장됩니다.

주요 함수:
- `list_available_configs()`
- `retrieve_documents(...)`
- `generate_answer(...)`
- `run_query_session(...)`

간단 예시:
```python
from rag_pipeline.query_service import run_query_session

result = run_query_session(
    query="Who is Dudley?",
    retriever_name="hybrid",
    answer_language="English",
    top_k=3,
    with_answer=True,
)

print(result["answer"])
print([doc["source_file"] for doc in result["docs"]])
```

### `question_service.py`
`query_service.py`의 함수들을 재출력(re-export)하는 호환용 얇은 래퍼입니다.
현재 실질적인 핵심 서비스는 `query_service.py`에 있습니다.

## 실행이 정상일 때 보이는 것
- 검색된 source preview가 먼저 출력됨
- 이후 generation 단계가 실행됨
- 마지막에 최종 답변과 reference list가 출력됨

## 현재 기본 산출물
- chunks: `data/text/processed/chunks_structure_text_512_metadata.json`
- index: `vector_db/faiss_text_structure_text_512.index`

## 주의사항
- 청크와 인덱스가 없으면 먼저 생성해야 합니다.
- EXAONE 로컬 모델 로딩이 필요하므로 첫 실행은 느릴 수 있습니다.
- `langchain-huggingface`는 `requirements.txt`에 별도 명시되어 있지 않지만, `runtime.py`에서 설치 여부를 자동으로 감지하여 fallback 처리합니다. 명시적으로 설치하려면 `pip install langchain-huggingface`를 실행하세요.
- 기본 파이프라인은 연구/검증용 구조이며, retrieval 품질이 answer 품질에 직접 영향을 줍니다.

## 현재 한계
- 일부 질문에서는 retrieval이 충분한 근거를 못 찾을 수 있습니다.
- Harry Potter 데이터셋 특성상 이름 언급만 있는 청크가 섞이면 answer 품질이 흔들릴 수 있습니다.
- 실무용 제품보다는 실험/연구용 코드에 더 가깝습니다.

## 문서 안내
- 실행/운영/평가 기준: `RAG_PIPELINE.md`
