import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { FinalResponse } from '../components/FinalResponse';
import { EvidenceChunks } from '../components/EvidenceChunks';
import { ReferenceList } from '../components/ReferenceList';
import { DebugLogs } from '../components/DebugLogs';
import { Button } from '../components/ui/button';
import { MessageSquarePlus } from 'lucide-react';
import { useRAG } from '../context/RAGContext';
import { useEffect } from 'react';

export function ResultsPage() {
  const navigate = useNavigate();
  const { result, debugLogs, processingState, resetState, performSearch } = useRAG();

  // Redirect if no result
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
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-4 sm:space-y-6">
        <Header />

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleAskAnother}
            className="flex items-center gap-2 border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/20 hover:border-[#d4af37]"
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

        {result && (
          <>
            <EvidenceChunks docs={result.docs} />
            <ReferenceList sources={result.sources} />
          </>
        )}

        {debugLogs.length > 0 && (
          <DebugLogs logs={debugLogs} />
        )}
      </div>
    </div>
  );
}
