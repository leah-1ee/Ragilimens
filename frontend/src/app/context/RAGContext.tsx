import { createContext, useContext, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';

const API_BASE_URL =
  import.meta.env.VITE_RAG_API_BASE_URL ?? 'http://localhost:8000';

const POLLING_INTERVAL_MS = 500;

export type ProcessingState =
  | 'idle'
  | 'queued'
  | 'retrieving'
  | 'generating'
  | 'completed'
  | 'error';

export interface RetrievalConfig {
  method: 'hybrid' | 'faiss' | 'bm25';
  language: 'English' | 'Korean';
  topK: number;
  chunkConfig: string;
  metadataFilter?: string;
}

export interface DocumentChunk {
  source_file: string;
  text: string;
}

export interface RAGResult {
  query: string;
  answer: string;
  retriever_name: string;
  answer_language: string;
  top_k: number;
  selected_config: string;
  chunks_path: string;
  index_path: string;
  retrieval_time: number;
  generation_time: number;
  docs: DocumentChunk[];
  sources: string[];
}

interface RAGJobStatus {
  job_id: string;
  status: ProcessingState;
  progress: number;
  message: string;
  result?: unknown;
  error?: string | null;
}

interface RAGContextType {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  config: RetrievalConfig;
  setConfig: Dispatch<SetStateAction<RetrievalConfig>>;
  processingState: ProcessingState;
  setProcessingState: Dispatch<SetStateAction<ProcessingState>>;
  processingProgress: number;
  processingMessage: string;
  result: RAGResult | null;
  setResult: Dispatch<SetStateAction<RAGResult | null>>;
  debugLogs: string[];
  setDebugLogs: Dispatch<SetStateAction<string[]>>;
  errorMessage: string;
  setErrorMessage: Dispatch<SetStateAction<string>>;
  performSearch: () => Promise<void>;
  resetState: () => void;
}

const RAGContext = createContext<RAGContextType | undefined>(undefined);

const sleep = (milliseconds: number) =>
  new Promise(resolve => setTimeout(resolve, milliseconds));

function normalizeResult(
  data: any,
  fallbackQuery: string,
  fallbackConfig: RetrievalConfig,
): RAGResult {
  const docs: DocumentChunk[] = Array.isArray(data?.docs)
    ? data.docs.map((doc: Partial<DocumentChunk>) => ({
        source_file: doc.source_file ?? 'unknown',
        text: doc.text ?? '',
      }))
    : [];

  const sources: string[] = Array.isArray(data?.sources)
    ? data.sources
    : Array.from(new Set(docs.map(doc => doc.source_file)));

  return {
    query: data?.query ?? fallbackQuery,
    answer: data?.answer ?? '',
    retriever_name: data?.retriever_name ?? fallbackConfig.method,
    answer_language: data?.answer_language ?? fallbackConfig.language,
    top_k: Number(data?.top_k ?? fallbackConfig.topK),
    selected_config: data?.selected_config ?? fallbackConfig.chunkConfig,
    chunks_path: data?.chunks_path ?? '',
    index_path: data?.index_path ?? '',
    retrieval_time: Number(data?.retrieval_time ?? 0),
    generation_time: Number(data?.generation_time ?? 0),
    docs,
    sources,
  };
}

function extractErrorMessage(
  errorData: any,
  fallbackMessage: string,
): string {
  if (typeof errorData?.detail === 'string') {
    return errorData.detail;
  }

  if (typeof errorData?.detail?.message === 'string') {
    return errorData.detail.message;
  }

  return fallbackMessage;
}

export function RAGProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('');

  const [config, setConfig] = useState<RetrievalConfig>({
    method: 'hybrid',
    language: 'English',
    topK: 3,
    chunkConfig: 'structure_text_512',
  });

  const [processingState, setProcessingState] =
    useState<ProcessingState>('idle');

  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState('');
  const [result, setResult] = useState<RAGResult | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const addLog = (log: string) => {
    setDebugLogs(previousLogs => [...previousLogs, log]);
  };

  const performSearch = async () => {
    if (!query.trim()) {
      setErrorMessage('Please enter a question');
      setProcessingState('idle');
      return;
    }

    try {
      setErrorMessage('');
      setDebugLogs([]);
      setResult(null);
      setProcessingState('queued');
      setProcessingProgress(10);
      setProcessingMessage('Sending query to the RAG backend...');

      addLog('[INFO] Initializing RAG System Components...');
      addLog(`[QUERY] ${query}`);
      addLog(`[INFO] Retrieval Method: ${config.method}`);
      addLog(`[INFO] Answer Language: ${config.language}`);
      addLog(`[INFO] Top-K Chunks: ${config.topK}`);
      addLog(`[INFO] Chunk Config: ${config.chunkConfig}`);

      let metadataFilter: Record<string, unknown> | null = null;

      if (config.metadataFilter?.trim()) {
        try {
          metadataFilter = JSON.parse(config.metadataFilter);
        } catch {
          setErrorMessage('Metadata filter must be valid JSON');
          setProcessingState('idle');
          setProcessingProgress(0);
          setProcessingMessage('');
          addLog('[ERROR] Metadata filter must be valid JSON');
          return;
        }
      }

      const createResponse = await fetch(`${API_BASE_URL}/api/rag/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          retriever_name: config.method,
          answer_language: config.language,
          top_k: config.topK,
          selected_config: config.chunkConfig,
          metadata_filter: metadataFilter,
        }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json().catch(() => null);

        throw new Error(
          extractErrorMessage(
            errorData,
            `Request failed with status ${createResponse.status}`,
          ),
        );
      }

      const createdJob: RAGJobStatus = await createResponse.json();
      const jobId = createdJob.job_id;

      setProcessingState(createdJob.status);
      setProcessingProgress(createdJob.progress ?? 10);
      setProcessingMessage(createdJob.message ?? 'Query received.');

      let previousStatus: ProcessingState | null = null;

      while (true) {
        await sleep(POLLING_INTERVAL_MS);

        const statusResponse = await fetch(
          `${API_BASE_URL}/api/rag/jobs/${jobId}`,
        );

        if (!statusResponse.ok) {
          const errorData = await statusResponse.json().catch(() => null);

          throw new Error(
            extractErrorMessage(
              errorData,
              `Status request failed with status ${statusResponse.status}`,
            ),
          );
        }

        const job: RAGJobStatus = await statusResponse.json();

        setProcessingState(job.status);
        setProcessingProgress(Number(job.progress ?? 0));
        setProcessingMessage(job.message ?? '');

        if (job.status !== previousStatus) {
          addLog(
            `[PROCESS] ${job.status}: ${job.message ?? 'Processing...'}`,
          );

          previousStatus = job.status;
        }

        if (job.status === 'completed') {
          const normalizedResult = normalizeResult(
            job.result,
            query,
            config,
          );

          addLog(`[INFO] Chunks Path: ${normalizedResult.chunks_path}`);
          addLog(`[INFO] Index Path: ${normalizedResult.index_path}`);
          addLog(
            `[INFO] Database: ${normalizedResult.docs.length} chunks retrieved`,
          );
          addLog(
            `[DEBUG] Retrieval completed in ${normalizedResult.retrieval_time.toFixed(4)}s`,
          );
          addLog(
            `[DEBUG] Generation completed in ${normalizedResult.generation_time.toFixed(4)}s`,
          );
          addLog('[SUCCESS] Answer generated successfully');

          setResult(normalizedResult);
          setProcessingProgress(100);
          setProcessingMessage('Answer generated successfully.');
          setProcessingState('completed');

          return;
        }

        if (job.status === 'error') {
          throw new Error(job.error ?? 'Unknown backend error');
        }
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      setProcessingState('error');
      setProcessingProgress(100);
      setProcessingMessage(errorMsg);
      setErrorMessage(`Failed to generate answer: ${errorMsg}`);
      addLog(`[ERROR] ${errorMsg}`);
    }
  };

  const resetState = () => {
    setQuery('');
    setProcessingState('idle');
    setProcessingProgress(0);
    setProcessingMessage('');
    setResult(null);
    setDebugLogs([]);
    setErrorMessage('');
  };

  return (
    <RAGContext.Provider
      value={{
        query,
        setQuery,
        config,
        setConfig,
        processingState,
        setProcessingState,
        processingProgress,
        processingMessage,
        result,
        setResult,
        debugLogs,
        setDebugLogs,
        errorMessage,
        setErrorMessage,
        performSearch,
        resetState,
      }}
    >
      {children}
    </RAGContext.Provider>
  );
}

export function useRAG() {
  const context = useContext(RAGContext);

  if (context === undefined) {
    throw new Error('useRAG must be used within a RAGProvider');
  }

  return context;
}
