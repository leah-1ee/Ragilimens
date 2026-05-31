import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Sparkles, Database, Brain } from 'lucide-react';

export function Header() {
  return (
    <Card className="p-6 sm:p-8 bg-[#080b24]/68 backdrop-blur-md border-2 border-[#d4af37]/40 relative overflow-hidden shadow-xl">
      {/* Decorative corner ornaments */}
      <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-[#d4af37] opacity-35" />
      <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-[#d4af37] opacity-35" />
      <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-[#d4af37] opacity-35" />
      <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-[#d4af37] opacity-35" />

      <div className="flex flex-col lg:flex-row items-start justify-between gap-4 sm:gap-6 relative z-10">
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <img
              src="/images/harry-glasses-gold.png"
              alt="Harry Potter glasses"
              className="w-10 h-10 sm:w-14 sm:h-14 flex-shrink-0 object-contain"
            />

            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#f4c430]"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              Harry Potter RAG Q&amp;A System
            </h1>
          </div>

          <p
            className="text-base sm:text-lg text-[#d4af37]/85"
            style={{ fontFamily: 'Philosopher, serif' }}
          >
            Ask questions grounded in Harry Potter text data using hybrid retrieval and local LLM generation.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <Badge
            variant="secondary"
            className="bg-[#111633]/75 text-[#d4af37] border border-[#d4af37]/35 hover:bg-[#1c2244]/90"
          >
            <Database className="w-3 h-3 mr-1" />
            Hybrid Retrieval
          </Badge>

          <Badge
            variant="secondary"
            className="bg-[#111633]/75 text-[#d4af37] border border-[#d4af37]/35 hover:bg-[#1c2244]/90"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            FAISS + BM25
          </Badge>

          <Badge
            variant="secondary"
            className="bg-[#111633]/75 text-[#d4af37] border border-[#d4af37]/35 hover:bg-[#1c2244]/90"
          >
            <Brain className="w-3 h-3 mr-1" />
            Grounded Generation
          </Badge>
        </div>
      </div>
    </Card>
  );
}
