import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { FinalResponse } from '../components/FinalResponse';
import { EvidenceChunks } from '../components/EvidenceChunks';
import { ReferenceList } from '../components/ReferenceList';
import { DebugLogs } from '../components/DebugLogs';
import { Button } from '../components/ui/button';
import { MessageSquarePlus } from 'lucide-react';
import { useRAG } from '../context/RAGContext';

export function ResultsPage() {
  const navigate = useNavigate();

  const {
    result,
    debugLogs,
    processingState,
    resetState,
    performSearch,
  } = useRAG();

  // Redirect to the question page when no result exists.
  useEffect(() => {
    if (!result && processingState === 'idle') {
      navigate('/ask');
    }
  }, [result, processingState, navigate]);

  const handleAskAnother = () => {
    resetState();
    navigate('/ask');
  };

  const handleRegenerate = async () => {
    await performSearch();
  };

  if (!result) {
    return null;
  }

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

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleAskAnother}
            className="flex items-center gap-2 bg-[#05071a]/88 backdrop-blur-md border-[#d4af37]/40 text-[#d4af37] hover:bg-[#111633]/95 hover:border-[#d4af37]"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            <MessageSquarePlus className="w-4 h-4" />
            Ask Another Question
          </Button>
        </div>

        <FinalResponse
          result={result}
          onRegenerate={handleRegenerate}
          processingState={processingState}
        />

        <EvidenceChunks docs={result.docs} />

        <ReferenceList sources={result.sources} />

        {debugLogs.length > 0 && (
          <DebugLogs logs={debugLogs} />
        )}
      </div>
    </div>
  );
}
