import { useNavigate } from 'react-router';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  BookOpen,
  Sparkles,
  Database,
  Brain,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '../components/ui/badge';

export function MainPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-fixed"
      style={{
        backgroundImage:
          "linear-gradient(rgba(6, 8, 30, 0.72), rgba(6, 8, 30, 0.82)), url('/images/main-background.jpg')",
      }}
    >
      <div className="max-w-4xl w-full space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center">
            <img
              src="/images/harry-glasses-gold.png"
              alt="Harry Potter glasses and lightning bolt"
              className="w-28 h-28 sm:w-32 sm:h-32 object-contain"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <img
                src="/images/ragilimens.png"
                alt="Ragilimens"
                className="w-full max-w-3xl h-auto object-contain"
              />
            </div>

            <h2
              className="text-3xl sm:text-4xl font-bold text-[#f4c430]"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              Harry Potter RAG Q&amp;A System
            </h2>

            <p
              className="text-lg sm:text-xl text-[#d4af37]/80 max-w-2xl mx-auto"
              style={{ fontFamily: 'Philosopher, serif' }}
            >
              Ask questions grounded in Harry Potter text data using hybrid
              retrieval and local LLM generation.
            </p>
          </div>

          {/* Technology Badges */}
          <div className="flex flex-wrap justify-center gap-3">
            <Badge
              variant="secondary"
              className="text-base px-4 py-2 bg-[#1a1d3a] text-[#d4af37] border border-[#d4af37]/30"
            >
              <Database className="w-4 h-4 mr-2" />
              Hybrid Retrieval
            </Badge>

            <Badge
              variant="secondary"
              className="text-base px-4 py-2 bg-[#1a1d3a] text-[#d4af37] border border-[#d4af37]/30"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              FAISS + BM25
            </Badge>

            <Badge
              variant="secondary"
              className="text-base px-4 py-2 bg-[#1a1d3a] text-[#d4af37] border border-[#d4af37]/30"
            >
              <Brain className="w-4 h-4 mr-2" />
              Grounded Generation
            </Badge>
          </div>
        </div>

        {/* Start Asking Questions Panel */}
        <Card
          className="relative overflow-hidden cursor-pointer border-2 border-[#d4af37]/60 hover:border-[#d4af37] shadow-2xl transition-all transform hover:scale-[1.02] bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/images/start-question-background.jpg')",
          }}
          onClick={() => navigate('/ask')}
        >
          {/* Dark overlay for readable text */}
          <div className="absolute inset-0 bg-[#080b24]/45" />

          {/* Corner decorations */}
          <div className="absolute top-2 left-2 w-12 h-12 border-t-2 border-l-2 border-[#d4af37] opacity-70" />
          <div className="absolute top-2 right-2 w-12 h-12 border-t-2 border-r-2 border-[#d4af37] opacity-70" />
          <div className="absolute bottom-2 left-2 w-12 h-12 border-b-2 border-l-2 border-[#d4af37] opacity-70" />
          <div className="absolute bottom-2 right-2 w-12 h-12 border-b-2 border-r-2 border-[#d4af37] opacity-70" />

          <CardContent className="relative z-10 p-10 sm:p-16 min-h-[360px] flex items-center justify-center">
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center">
                <div className="p-4 bg-[#d4af37]/20 border-2 border-[#d4af37]">
                  <Sparkles className="w-12 h-12 text-[#d4af37]" />
                </div>
              </div>

              <div className="space-y-2">
                <h3
                  className="text-2xl sm:text-4xl font-bold text-[#f4c430]"
                  style={{ fontFamily: 'Cinzel, serif' }}
                >
                  Start Asking Questions
                </h3>

                <p
                  className="text-base sm:text-lg text-[#d4af37]/90"
                  style={{ fontFamily: 'Philosopher, serif' }}
                >
                  Explore the magical world of Harry Potter through AI-powered
                  question answering
                </p>
              </div>

              <Button
                size="lg"
                className="bg-[#d4af37] hover:bg-[#f4c430] text-[#0a0e27] text-lg px-8 py-6 font-bold border-2 border-[#d4af37] transition-all"
                style={{
                  fontFamily: 'Cinzel, serif',
                  letterSpacing: '0.1em',
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  navigate('/ask');
                }}
              >
                Ask a Question
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
