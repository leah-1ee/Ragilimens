import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { BookOpen, Sparkles, Database, Brain } from 'lucide-react';

export function Header() {
  return (
    <Card className="p-6 sm:p-8 bg-[#1a1d3a] border-2 border-[#d4af37]/30 relative overflow-hidden">
      {/* Decorative corner ornaments */}
      <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-[#d4af37] opacity-30" />
      <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-[#d4af37] opacity-30" />
      <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-[#d4af37] opacity-30" />
      <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-[#d4af37] opacity-30" />

      <div className="flex flex-col lg:flex-row items-start justify-between gap-4 sm:gap-6 relative z-10">
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 text-[#d4af37]" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#f4c430]" style={{ fontFamily: 'Cinzel, serif' }}>
              Harry Potter RAG Demo Dashboard
            </h1>
          </div>
          <p className="text-base sm:text-lg text-[#d4af37]/80" style={{ fontFamily: 'Philosopher, serif' }}>
            Ask questions grounded in Harry Potter text data using hybrid retrieval and local LLM generation.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <Badge variant="secondary" className="bg-[#2a2d4a] text-[#d4af37] border border-[#d4af37]/30 hover:bg-[#3a3d5a]">
            <Database className="w-3 h-3 mr-1" />
            Hybrid Retrieval
          </Badge>
          <Badge variant="secondary" className="bg-[#2a2d4a] text-[#d4af37] border border-[#d4af37]/30 hover:bg-[#3a3d5a]">
            <Sparkles className="w-3 h-3 mr-1" />
            FAISS + BM25
          </Badge>
          <Badge variant="secondary" className="bg-[#2a2d4a] text-[#d4af37] border border-[#d4af37]/30 hover:bg-[#3a3d5a]">
            <Brain className="w-3 h-3 mr-1" />
            Grounded Generation
          </Badge>
        </div>
      </div>
    </Card>
  );
}
