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

## 웹 프론트엔드

### 개요

웹 프론트엔드는 React, TypeScript, Vite를 기반으로 구현되어 있습니다. Tailwind CSS를 사용하여 스타일을 구성하고, Radix UI 기반 공통 컴포넌트와 `lucide-react` 아이콘을 활용합니다.

사용자는 브라우저에서 질문을 입력하고 검색 방식, 답변 언어, Top-K 값을 설정할 수 있습니다. 질의가 완료되면 최종 답변과 함께 검색된 근거 청크, 출처 목록, 디버그 로그를 확인할 수 있습니다.

### 주요 페이지

| 경로         | 페이지       | 역할                          |
| ---------- | --------- | --------------------------- |
| `/`        | 메인 페이지    | 시스템 소개 및 질문 입력 화면 진입        |
| `/ask`     | 질문 입력 페이지 | 질문 입력 및 retrieval 옵션 설정     |
| `/results` | 결과 페이지    | 최종 답변, 근거 청크, 출처, 디버그 로그 표시 |

### 프론트엔드 디렉터리 구조

```text
frontend/
├── .env.example                # FastAPI 서버 주소 설정 예시
├── public/
│   └── images/                 # 배경 이미지, 로고, 장식 이미지
├── src/
│   ├── main.tsx                # React 애플리케이션 진입점
│   ├── styles/                 # 전역 스타일
│   └── app/
│       ├── App.tsx             # RouterProvider 설정
│       ├── routes.tsx          # 페이지 라우팅 정의
│       ├── context/
│       │   └── RAGContext.tsx  # 공통 상태 관리 및 API 요청 처리
│       ├── pages/
│       │   ├── MainPage.tsx
│       │   ├── AskQuestionPage.tsx
│       │   └── ResultsPage.tsx
│       └── components/
│           ├── Header.tsx
│           ├── QueryInput.tsx
│           ├── RetrievalSettings.tsx
│           ├── ProcessingDialog.tsx
│           ├── FinalResponse.tsx
│           ├── EvidenceChunks.tsx
│           ├── ReferenceList.tsx
│           ├── DebugLogs.tsx
│           └── ui/             # 공통 UI primitive 컴포넌트
├── package.json
├── package-lock.json
├── tsconfig.json
└── vite.config.ts
```

## 현재 아키텍처

### 전체 구조

```text
브라우저
  ↓
React 프론트엔드 (`localhost:5173`)
  ↓ HTTP 요청
FastAPI 래퍼 (`localhost:8000`)
  ↓ Python 함수 호출
`rag_pipeline/query_service.py`
  ↓
선택한 retrieval 방식에 따른 문서 검색
  ↓
로컬 LLM 기반 답변 생성
```

기본 검색 방식은 `hybrid`이며, FAISS 기반 의미 검색과 BM25 기반 키워드 검색을 결합합니다. 필요에 따라 `faiss`, `bm25`, `hybrid` 중 하나를 선택할 수 있습니다.

### 주요 모듈

- `api/server.py`
  - React 프론트엔드와 Python RAG 로직을 연결하는 FastAPI 래퍼
  - 동기 질의 API와 job 기반 진행 상태 조회 API 제공
- `frontend/`
  - React, TypeScript, Vite 기반 웹 프론트엔드
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


## FastAPI 래퍼를 사용하는 이유

React 프론트엔드는 브라우저의 JavaScript 실행 환경에서 동작합니다. 반면 기존 RAG 파이프라인은 Ubuntu 환경의 Python 프로세스에서 실행되며, FAISS 인덱스, BM25 검색, 로컬 모델, Hugging Face 모델 캐시를 사용합니다.

브라우저에서 실행되는 React 코드는 Python 모듈을 직접 import하거나 실행할 수 없습니다. 또한 서버의 로컬 파일 시스템이나 CPU 메모리에 로딩된 로컬 LLM에 직접 접근할 수 없습니다.

따라서 React 프론트엔드와 Python RAG 로직 사이에는 HTTP API와 같은 통신 계층이 필요합니다.

FastAPI는 기존 RAG 로직을 대체하지 않습니다. `rag_pipeline/query_service.py`의 Python 함수를 그대로 재사용하면서, 브라우저에서 HTTP 요청을 통해 접근할 수 있도록 연결하는 래퍼 역할을 합니다.

---

## API 서버

### 환경변수 설정

프론트엔드는 환경변수를 사용하여 FastAPI 서버 주소를 지정합니다.

프론트엔드 폴더에서 예시 파일을 복사합니다.

```bash
cd frontend
cp .env.example .env.local
```

기본 설정은 다음과 같습니다.

```env
VITE_RAG_API_BASE_URL=http://localhost:8000
```

각 포트의 역할은 다음과 같습니다.

| 주소                      | 역할                              |
| ----------------------- | ------------------------------- |
| `http://localhost:5173` | 사용자가 접속하는 React 개발 서버           |
| `http://localhost:8000` | React 프론트엔드가 요청을 보내는 FastAPI 서버 |

`RAGContext.tsx`에도 `http://localhost:8000`이 기본값으로 설정되어 있으므로, 로컬 개발 환경에서는 `.env.local` 파일이 없어도 실행할 수 있습니다.

### API 엔드포인트

| HTTP 메서드 | 경로                       | 역할                            |
| -------- | ------------------------ | ----------------------------- |
| `GET`    | `/`                      | API 서버 기본 안내                  |
| `GET`    | `/api/rag/health`        | API 서버 실행 여부 확인               |
| `GET`    | `/api/rag/configs`       | 사용 가능한 chunk/index 설정 조회      |
| `POST`   | `/api/rag/query`         | retrieval 및 답변 생성을 동기 방식으로 실행 |
| `POST`   | `/api/rag/jobs`          | 비동기 RAG 작업 생성                 |
| `GET`    | `/api/rag/jobs/{job_id}` | 작업 진행 상태 및 결과 조회              |

웹 프론트엔드는 진행 상태를 표시하기 위해 `/api/rag/jobs`와 `/api/rag/jobs/{job_id}`를 사용합니다. `/api/rag/query`는 동기 질의 또는 API 직접 테스트를 위해 유지합니다.

### 질의 요청 예시

```json
{
  "query": "Who is Dudley?",
  "retriever_name": "hybrid",
  "answer_language": "English",
  "top_k": 3,
  "selected_config": "structure_text_512",
  "metadata_filter": null
}
```

### 웹 질의 처리 흐름

1. 사용자가 `/ask` 페이지에서 질문과 retrieval 옵션을 입력합니다.
2. 프론트엔드는 `POST /api/rag/jobs` 요청을 보내고 `job_id`를 받습니다.
3. 백엔드는 선택한 검색 방식으로 관련 청크를 검색합니다.
4. 검색이 완료되면 로컬 LLM으로 답변을 생성합니다.
5. 프론트엔드는 `500ms`마다 `GET /api/rag/jobs/{job_id}`를 호출하여 현재 상태를 확인합니다.
6. 처리가 완료되면 `/results` 페이지에서 답변, 근거 청크, 출처, 디버그 로그를 표시합니다.

### CORS 설정

React 개발 서버와 FastAPI 서버는 서로 다른 포트를 사용합니다. 브라우저의 교차 출처 요청 제한을 고려하여 FastAPI에서는 `localhost:5173`과 `127.0.0.1:5173`에서 오는 요청을 허용합니다.

---

## 진행 상태 표시

백엔드는 실제 처리 단계에 따라 다음 상태를 반환합니다.

| 상태           | 의미                            | 대표 진행률 |
| ------------ | ----------------------------- | -----: |
| `queued`     | 요청 접수                         |    10% |
| `retrieving` | 선택한 retrieval 방식에 따른 관련 문서 검색 |    35% |
| `generating` | 로컬 LLM 기반 답변 생성               |    70% |
| `completed`  | 답변 생성 완료                      |   100% |
| `error`      | 처리 실패                         |   100% |

`retrieving` 단계에서는 사용자가 선택한 방식에 따라 FAISS 벡터 검색, BM25 키워드 검색 또는 두 방식을 결합한 hybrid retrieval을 수행합니다.

위 진행률은 단계별 대표값입니다. 예를 들어 `70%`는 생성 작업이 정확히 70% 완료되었다는 의미가 아니라, 답변 생성 단계에 진입했다는 의미입니다.

토큰 단위의 정밀한 진행률이나 생성 중간 결과를 표시하려면 별도의 스트리밍 구현이 필요합니다.

## 빠른 시작

### Python 의존성 설치

```bash
python3 -m pip install -r requirements.txt
```

### 청킹 및 인덱스 생성

```bash
python3 scripts/chunk_dataset.py \
  --mode structure_text \
  --chunk-size 512 \
  --output data/text/processed/chunks_structure_text_512.json

python3 scripts/build_index.py \
  --chunks-path data/text/processed/chunks_structure_text_512.json \
  --index-path vector_db/faiss_text_structure_text_512.index \
  --metadata-path data/text/processed/chunks_structure_text_512_metadata.json
```

### CLI 실행

```bash
python3 main.py --query "Who is Dudley?" --k 3
```

대화형 검증:
```bash
python3 question.py
```

### 웹 UI 통합 실행

청크 파일과 FAISS 인덱스를 먼저 생성해야 합니다.
터미널 1에서 FastAPI 서버를 실행합니다.

```bash
python3 -m uvicorn api.server:app --host 0.0.0.0 --port 8000 --reload
```

API 서버 상태를 확인합니다.

```bash
curl http://127.0.0.1:8000/api/rag/health
curl http://127.0.0.1:8000/api/rag/configs
```

터미널 2에서 React 프론트엔드를 실행합니다.

```bash
cd frontend
npm ci
npm run dev
```

`package-lock.json`이 없거나 의존성을 갱신해야 하는 경우에는 `npm install`을 사용합니다.

브라우저에서 다음 주소로 접속합니다.

```text
http://localhost:5173
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

CLI 실행 시 다음 내용을 확인할 수 있습니다.

- 검색된 source preview가 먼저 출력됨
- 이후 generation 단계가 실행됨
- 마지막에 최종 답변과 reference list가 출력됨

웹 UI 실행 시 다음 내용을 확인할 수 있습니다

- 잘문 입력 후 처리 단계 팝업이 표시됨
- 이후 검색된 근거 청크를 바탕으로 답변 생성 단계가 진행됨
- 마지막에 최종 답변, 검색된 근거 청크, 출처 목록, 디버그 로그가 출력됨


## 현재 기본 산출물
- chunks: `data/text/processed/chunks_structure_text_512_metadata.json`
- index: `vector_db/faiss_text_structure_text_512.index`

## 주의사항
- 청크와 인덱스가 없으면 먼저 생성해야 합니다.
- 웹 UI에서 실제 RAG 질의를 실행하려면 FastAPI 서버와 React 개발 서버를 모두 실행해야 합니다.
- EXAONE 로컬 모델 로딩이 필요하므로 첫 실행은 느릴 수 있습니다.
- `frontend/node_modules/`와 `frontend/dist/`는 자동 생성 파일이므로 Git에 커밋하지 않습니다.
- 비동기 작업 상태는 FastAPI 프로세스의 메모리에 저장됩니다. API 서버를 재시작하면 기존 작업 상태는 사라집니다.
- 현재 job 처리는 로컬 시연을 위한 단순 백그라운드 스레드 방식입니다. 다수 사용자의 동시 요청을 처리하는 운영 환경에서는 별도의 작업 큐와 상태 저장소가 필요합니다.
- 현재 진행률은 처리 단계에 따른 대표값이며, 토큰 단위의 정밀한 완료율은 아닙니다.
- `langchain-huggingface`는 `requirements.txt`에 별도 명시되어 있지 않지만, `runtime.py`에서 설치 여부를 자동으로 감지하여 fallback 처리합니다. 명시적으로 설치하려면 `pip install langchain-huggingface`를 실행하세요.
- 기본 파이프라인은 연구/검증용 구조이며, retrieval 품질이 answer 품질에 직접 영향을 줍니다.

## 현재 한계
- 일부 질문에서는 retrieval이 충분한 근거를 못 찾을 수 있습니다.
- Harry Potter 데이터셋 특성상 이름 언급만 있는 청크가 섞이면 answer 품질이 흔들릴 수 있습니다.

## 문서 안내
- 실행/운영/평가 기준: `RAG_PIPELINE.md`
