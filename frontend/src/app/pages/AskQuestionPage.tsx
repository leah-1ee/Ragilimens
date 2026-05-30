import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { QueryInput } from '../components/QueryInput';
import { RetrievalSettings } from '../components/RetrievalSettings';
import { ProcessingDialog } from '../components/ProcessingDialog';
import { useRAG } from '../context/RAGContext';

export function AskQuestionPage() {
  const navigate = useNavigate();

  const {
    query,
    setQuery,
    config,
    setConfig,
    processingState,
    errorMessage,
    setErrorMessage,
    performSearch,
  } = useRAG();

  const [showProcessing, setShowProcessing] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      setErrorMessage('Please enter a question');
      return;
    }

    setShowProcessing(true);
    await performSearch();
  };

  const handleClear = () => {
    setQuery('');
    setErrorMessage('');
  };

  useEffect(() => {
    if (processingState === 'completed') {
      setShowProcessing(false);
      navigate('/results');
    }
  }, [processingState, navigate]);

  useEffect(() => {
    if (processingState === 'error') {
      setShowProcessing(false);
    }
  }, [processingState]);

  const isProcessing =
    processingState !== 'idle' &&
    processingState !== 'completed' &&
    processingState !== 'error';

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage:
          "linear-gradient(rgba(6, 8, 30, 0.62), rgba(6, 8, 30, 0.72)), url('/images/main-background.jpg')",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-4 sm:space-y-6">
        <Header />

        <QueryInput
          query={query}
          onQueryChange={setQuery}
          onSearch={handleSearch}
          onClear={handleClear}
          isProcessing={isProcessing}
          errorMessage={errorMessage}
        />

        <RetrievalSettings
          config={config}
          onConfigChange={setConfig}
          disabled={isProcessing}
        />

        <ProcessingDialog
          open={showProcessing}
          onOpenChange={setShowProcessing}
        />
      </div>
    </div>
  );
}
