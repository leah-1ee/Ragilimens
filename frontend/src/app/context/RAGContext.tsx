import { createContext, useContext, useState, ReactNode } from 'react';

export type ProcessingState = 'idle' | 'searching' | 'retrieving' | 'generating' | 'completed' | 'error';

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
  setQuery: (query: string) => void;
  config: RetrievalConfig;
  setConfig: (config: RetrievalConfig) => void;
  processingState: ProcessingState;
  setProcessingState: (state: ProcessingState) => void;
  result: RAGResult | null;
  setResult: (result: RAGResult | null) => void;
  debugLogs: string[];
  setDebugLogs: (logs: string[]) => void;
  addLog: (log: string) => void;
  errorMessage: string;
  setErrorMessage: (message: string) => void;
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
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [result, setResult] = useState<RAGResult | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

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
      addLog('[INFO] Initializing RAG System Components...');
      addLog(`[QUERY] ${query}`);

      setProcessingState('searching');
      addLog('[PROCESS] Searching for relevant document chunks (Hybrid Search: BM25 + Vector)...');

      await new Promise(resolve => setTimeout(resolve, 1500));

      setProcessingState('retrieving');
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockChunksPath = `data/text/processed/chunks_${config.chunkConfig}_metadata.json`;
      const mockIndexPath = `vector_db/faiss_text_${config.chunkConfig}.index`;

      addLog(`[INFO] Chunks Path: ${mockChunksPath}`);
      addLog(`[INFO] Index Path: ${mockIndexPath}`);

      const mockDocs: DocumentChunk[] = [
        {
          source_file: 'Book1.txt',
          text: 'The Dursleys had a small son called Dudley and in their opinion there was no finer boy anywhere. Dudley was a spoiled child who got everything he wanted from his parents.'
        },
        {
          source_file: 'Book4.txt',
          text: 'Dudley had reached roughly the size and weight of a young killer whale. He spent much of his time complaining about his diet and demanding more food.'
        },
        {
          source_file: 'Book7.txt',
          text: 'Dudley looked frightened and uncertain as the Dursleys prepared to leave Privet Drive. He had just shaken hands with Harry, a gesture that surprised everyone.'
        }
      ];

      addLog(`[INFO] Database: ${mockDocs.length} chunks retrieved`);
      addLog(`[DEBUG] Hybrid Retrieval completed in 5.7553s`);

      setProcessingState('generating');
      addLog('[PROCESS] Generating answer with local LLM (EXAONE 3.5)...');

      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockAnswer = config.language === 'Korean'
        ? '더들리 더즐리는 해리 포터의 사촌입니다. 그는 버논과 페투니아 더즐리의 아들이며 프리벳 가에서 함께 살았습니다. 검색된 맥락에 따르면, 더들리는 더즐리 가족의 일원으로 묘사되며 마법 세계 밖에서의 해리의 초기 삶과 관련하여 등장합니다.'
        : 'Dudley Dursley is Harry Potter\'s cousin. He is the son of Vernon and Petunia Dursley and lives with them at Privet Drive. In the retrieved context, Dudley is described as part of the Dursley family and appears in relation to Harry\'s early life outside the wizarding world. He is portrayed as a spoiled child who was overweight and often cruel to Harry.';

      addLog(`[DEBUG] Generation completed in 8.3241s`);

      const mockResult: RAGResult = {
        query,
        answer: mockAnswer,
        retriever_name: config.method,
        answer_language: config.language,
        top_k: config.topK,
        selected_config: config.chunkConfig,
        chunks_path: mockChunksPath,
        index_path: mockIndexPath,
        retrieval_time: 5.7553,
        generation_time: 8.3241,
        docs: mockDocs.slice(0, config.topK),
        sources: Array.from(new Set(mockDocs.slice(0, config.topK).map(d => d.source_file)))
      };

      setResult(mockResult);
      setProcessingState('completed');
      addLog('[SUCCESS] Answer generated successfully');
    } catch (error) {
      setProcessingState('error');
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      setErrorMessage(`Failed to generate answer: ${errorMsg}`);
      addLog(`[ERROR] ${errorMsg}`);
    }
  };

  const resetState = () => {
    setQuery('');
    setResult(null);
    setProcessingState('idle');
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
        addLog,
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
