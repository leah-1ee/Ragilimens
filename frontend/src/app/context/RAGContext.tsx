import { createContext, useContext, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';

const API_BASE_URL =
  import.meta.env.VITE_RAG_API_BASE_URL ?? 'http://localhost:8000';

export type ProcessingState =
  | 'idle'
  | 'searching'
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

interface RAGContextType {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  config: RetrievalConfig;
  setConfig: Dispatch<SetStateAction<RetrievalConfig>>;
  processingState: ProcessingState;
  setProcessingState: Dispatch<SetStateAction<ProcessingState>>;
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
  const [result, setResult] = useState<RAGResult | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const addLog = (log: string) => {
    setDebugLogs(prev => [...prev, log]);
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

      addLog('[INFO] Initializing RAG System Components...');
      addLog(`[QUERY] ${query}`);

      let metadataFilter: Record<string, unknown> | null = null;

      if (config.metadataFilter?.trim()) {
        try {
          metadataFilter = JSON.parse(config.metadataFilter);
        } catch {
          setErrorMessage('Metadata filter must be valid JSON');
          setProcessingState('idle');
          addLog('[ERROR] Metadata filter must be valid JSON');
          return;
        }
      }

      setProcessingState('searching');
      addLog(
        `[PROCESS] Sending query to RAG backend using ${config.method} retrieval...`
      );

      const response = await fetch(`${API_BASE_URL}/api/rag/query`, {
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

      setProcessingState('retrieving');

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        let message = `Request failed with status ${response.status}`;

        if (typeof errorData?.detail === 'string') {
          message = errorData.detail;
        } else if (errorData?.detail?.message) {
          message = errorData.detail.message;
        }

        throw new Error(message);
      }

      setProcessingState('generating');

      const data = await response.json();

      const docs: DocumentChunk[] = Array.isArray(data.docs)
        ? data.docs.map((doc: Partial<DocumentChunk>) => ({
            source_file: doc.source_file ?? 'unknown',
            text: doc.text ?? '',
          }))
        : [];

      const sources: string[] = Array.isArray(data.sources)
        ? data.sources
        : Array.from(new Set(docs.map(doc => doc.source_file)));

      const normalizedResult: RAGResult = {
        query: data.query ?? query,
        answer: data.answer ?? '',
        retriever_name: data.retriever_name ?? config.method,
        answer_language: data.answer_language ?? config.language,
        top_k: Number(data.top_k ?? config.topK),
        selected_config: data.selected_config ?? config.chunkConfig,
        chunks_path: data.chunks_path ?? '',
        index_path: data.index_path ?? '',
        retrieval_time: Number(data.retrieval_time ?? 0),
        generation_time: Number(data.generation_time ?? 0),
        docs,
        sources,
      };

      addLog(`[INFO] Chunks Path: ${normalizedResult.chunks_path}`);
      addLog(`[INFO] Index Path: ${normalizedResult.index_path}`);
      addLog(`[INFO] Database: ${normalizedResult.docs.length} chunks retrieved`);
      addLog(
        `[DEBUG] Retrieval completed in ${normalizedResult.retrieval_time.toFixed(4)}s`
      );
      addLog(
        `[DEBUG] Generation completed in ${normalizedResult.generation_time.toFixed(4)}s`
      );

      setResult(normalizedResult);
      setProcessingState('completed');
      addLog('[SUCCESS] Answer generated successfully');
    } catch (error) {
      setProcessingState('error');

      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      setErrorMessage(`Failed to generate answer: ${errorMsg}`);
      addLog(`[ERROR] ${errorMsg}`);
    }
  };

  const resetState = () => {
    setQuery('');
    setProcessingState('idle');
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
