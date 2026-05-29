import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Copy, RefreshCw, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import type { RAGResult, ProcessingState } from '../context/RAGContext';

interface FinalResponseProps {
  result: RAGResult | null;
  onRegenerate: () => void;
  processingState: ProcessingState;
}

export function FinalResponse({ result, onRegenerate, processingState }: FinalResponseProps) {
  const handleCopy = () => {
    if (result?.answer) {
      navigator.clipboard.writeText(result.answer);
      toast.success('Answer copied to clipboard');
    }
  };

  if (!result && processingState === 'idle') {
    return (
      <Card className="shadow-lg border-2 border-dashed border-[#d4af37]/30 bg-[#1a1d3a]">
        <CardContent className="py-16 text-center">
          <MessageSquare className="w-16 h-16 mx-auto text-[#d4af37]/40 mb-4" />
          <p className="text-lg text-[#d4af37]/60" style={{ fontFamily: 'Philosopher, serif' }}>
            Your generated answer will appear here after running a query.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (processingState === 'searching' || processingState === 'retrieving' || processingState === 'generating') {
    return (
      <Card className="shadow-lg bg-[#1a1d3a] border-2 border-[#d4af37]/30">
        <CardContent className="py-16">
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-[#d4af37]/20 rounded w-3/4" />
            <div className="h-4 bg-[#d4af37]/20 rounded w-full" />
            <div className="h-4 bg-[#d4af37]/20 rounded w-5/6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (processingState === 'error') {
    return (
      <Card className="shadow-lg border-2 border-red-500/50 bg-[#1a1d3a]">
        <CardContent className="py-12 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-red-400 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>Failed to generate answer</p>
          <p className="text-sm text-red-400/80" style={{ fontFamily: 'Philosopher, serif' }}>
            Please check whether the chunk metadata and FAISS index files are available.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!result) return null;

  return (
    <Card className="shadow-lg border-2 border-[#d4af37] bg-[#1a1d3a] relative overflow-hidden">
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-[#d4af37] opacity-30" />
      <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-[#d4af37] opacity-30" />

      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-[#f4c430]" style={{ fontFamily: 'Cinzel, serif' }}>
            <MessageSquare className="w-6 h-6 text-[#d4af37]" />
            Final AI Response
          </CardTitle>
          <Badge variant="secondary" className="bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]">
            {result.answer_language}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 relative z-10">
        <div className="prose prose-lg max-w-none">
          <p className="text-base leading-relaxed whitespace-pre-wrap text-[#d4af37]" style={{ fontFamily: 'Philosopher, serif' }}>
            {result.answer}
          </p>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-[#d4af37]/30">
          <div className="text-sm text-[#d4af37]/70" style={{ fontFamily: 'Philosopher, serif' }}>
            <span className="font-medium">Retrieval time:</span> {result.retrieval_time.toFixed(4)}s
            {' · '}
            <span className="font-medium">Generation time:</span> {result.generation_time.toFixed(4)}s
          </div>

          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={handleCopy} className="border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/20">
              <Copy className="w-4 h-4 mr-2" />
              Copy Answer
            </Button>
            <Button variant="outline" size="sm" onClick={onRegenerate} className="border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/20">
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
