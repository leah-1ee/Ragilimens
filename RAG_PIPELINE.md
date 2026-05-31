# RAG 파이프라인 실행/운영 가이드

이 문서는 현재 저장소 기준의 표준 실행 흐름, 경로 규칙, 평가 명령을 정리합니다.

## 1. 현재 표준 파이프라인
1. `scripts/chunk_dataset.py` 로 텍스트 청킹
2. `scripts/build_index.py` 로 FAISS 인덱스 생성
3. `main.py` 또는 `question.py` 로 질의 실행
4. `scripts/eval_retrieval.py` 등으로 retrieval 평가

## 2. 현재 권장 데이터 조합
- text chunks: `data/text/processed/chunks_structure_text_512_metadata.json`
- index: `vector_db/faiss_text_structure_text_512.index`
- eval queries: `data/eval/queries_text.jsonl`

현재 기본 CLI들은 위 산출물을 우선 사용합니다.

## 3. 표준 실행 명령
```bash
# 1) 의존성 설치
python3 -m pip install -r requirements.txt

# 2) structure_text 청킹 생성
python3 scripts/chunk_dataset.py \
  --mode structure_text \
  --chunk-size 512 \
  --output data/text/processed/chunks_structure_text_512.json

# 3) 인덱스 생성
python3 scripts/build_index.py \
  --chunks-path data/text/processed/chunks_structure_text_512.json \
  --index-path vector_db/faiss_text_structure_text_512.index \
  --metadata-path data/text/processed/chunks_structure_text_512_metadata.json

# 4) 비대화형 실행
python3 main.py --query "Who is Dudley?" --k 3

# 5) 대화형 실행
python3 question.py
```

## 4. 엔트리포인트 역할
- `main.py`
  - 비대화형 CLI
  - 자동 실행, 스크립트 호출, API 백엔드 연결에 적합
- `question.py`
  - 대화형 CLI
  - 사용자가 retrieval / answer를 빠르게 검증하기 적합
- 두 파일 모두 `rag_pipeline/query_service.py` 를 공용 서비스 레이어로 사용함

## 5. retrieval / generation 구조
- Chunking: `scripts/chunk_dataset.py`
- Vector index: `scripts/build_index.py`
- Shared query service: `rag_pipeline/query_service.py`
- Hybrid retrieval: `rag_pipeline/hybrid_retriever.py`
- Prompt build: `rag_pipeline/prompt.py`
- Generation: `rag_pipeline/rag_chain.py`

## 6. 실험 모드
- `structure_text`
  - 현재 텍스트 도메인 기본값
- `fixed`
- `line`
- `token`
- `structure_code`
  - 코드 데이터셋이 있을 때만 의미 있음

## 7. 평가 명령
```bash
python3 scripts/eval_retrieval.py \
  --queries data/eval/queries_text.jsonl \
  --chunks data/text/processed/chunks_structure_text_512_metadata.json \
  --index vector_db/faiss_text_structure_text_512.index \
  --k 5 \
  --out results/text_structure_metrics.json
```

상세 리포트:
```bash
python3 scripts/eval_detailed_report.py \
  --mode structure_text_512 \
  --queries data/eval/queries_text.jsonl \
  --chunks data/text/processed/chunks_structure_text_512_metadata.json \
  --index vector_db/faiss_text_structure_text_512.index \
  --out-md results/detailed_eval_structure_text_512.md \
  --out-json results/detailed_eval_structure_text_512.json \
  --k 5 \
  --rrf-k 60 \
  --with-answer
```

## 8. 현재 주요 파라미터
- chunk mode: `structure_text`
- chunk size: `512`
- overlap: `50`
- top_k: `3~5`
- rrf_k: `60`
- embedding model: `sentence-transformers/all-MiniLM-L6-v2`
- generation model: `LGAI-EXAONE/EXAONE-3.5-2.4B-Instruct`

## 9. 주의할 점
- `main.py`와 `question.py`의 기본 `hybrid` 경로는 동일한 query service를 사용함
- clean chunk/index 산출물이 이미 기본 경로에 반영되어 있음
- `vector_db/*.index` 는 재생성 가능 산출물이므로 저장소 운영 정책에 따라 커밋 여부를 조절해야 함

## 10. 트러블슈팅
- `FAISS index not found`
  - 인덱스 생성 먼저 실행
- `No available chunk/index configs found`
  - `data/text/processed` 와 `vector_db` 산출물 확인
- EXAONE 로딩이 느림
  - 첫 실행 전 warm-up 질의 1회 권장
- `langchain_huggingface` 관련 import 경고
  - `requirements.txt`에 별도 명시되어 있지 않으나, `runtime.py`에서 자동 fallback 처리됨
  - 경고를 없애려면 `pip install langchain-huggingface` 직접 설치
- `beautifulsoup4` / `cinemagoer` 관련 에러
  - 해당 패키지는 `requirements.txt`에 포함되어 있으나, 이를 사용하는 데이터 수집 스크립트(`fetch_imdb.py` 등)는 현재 저장소에 포함되어 있지 않음
  - 파이프라인 실행 자체에는 영향 없음
