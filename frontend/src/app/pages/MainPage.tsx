import { useNavigate } from 'react-router';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { BookOpen, Sparkles, Database, Brain, ArrowRight } from 'lucide-react';
import { Badge } from '../components/ui/badge';

export function MainPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          {/* Optional: Add Harry Potter logo here */}
          {/* <div className="flex items-center justify-center mb-4">
            <img src="/src/imports/image.png" alt="Harry Potter" className="h-32" />
          </div> */}

          <div className="flex items-center justify-center">
            <BookOpen className="w-20 h-20 text-[#d4af37]" />
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#d4af37]" style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.05em' }}>
              RAGILIMENTS
            </h1>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#f4c430]" style={{ fontFamily: 'Cinzel, serif' }}>
              Harry Potter RAG Q&A System
            </h2>
            <p className="text-lg sm:text-xl text-[#d4af37]/80 max-w-2xl mx-auto" style={{ fontFamily: 'Philosopher, serif' }}>
              Ask questions grounded in Harry Potter text data using hybrid retrieval and local LLM generation.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="secondary" className="text-base px-4 py-2 bg-[#1a1d3a] text-[#d4af37] border border-[#d4af37]/30">
              <Database className="w-4 h-4 mr-2" />
              Hybrid Retrieval
            </Badge>
            <Badge variant="secondary" className="text-base px-4 py-2 bg-[#1a1d3a] text-[#d4af37] border border-[#d4af37]/30">
              <Sparkles className="w-4 h-4 mr-2" />
              FAISS + BM25
            </Badge>
            <Badge variant="secondary" className="text-base px-4 py-2 bg-[#1a1d3a] text-[#d4af37] border border-[#d4af37]/30">
              <Brain className="w-4 h-4 mr-2" />
              Grounded Generation
            </Badge>
          </div>
        </div>

        {/* CTA Card */}
        <Card
          className="shadow-2xl border-2 border-[#d4af37]/50 hover:border-[#d4af37] transition-all cursor-pointer transform hover:scale-105 bg-[#1a1d3a] relative overflow-hidden group"
          onClick={() => navigate('/ask')}
        >
          {/* Hexagonal pattern overlay */}
          <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
                  <path d="M25,0 L50,14.43 L50,28.87 L25,43.3 L0,28.87 L0,14.43 Z" fill="none" stroke="#d4af37" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hexagons)" />
            </svg>
          </div>

          {/* Corner decorations */}
          <div className="absolute top-2 left-2 w-12 h-12 border-t-2 border-l-2 border-[#d4af37] opacity-50" />
          <div className="absolute top-2 right-2 w-12 h-12 border-t-2 border-r-2 border-[#d4af37] opacity-50" />
          <div className="absolute bottom-2 left-2 w-12 h-12 border-b-2 border-l-2 border-[#d4af37] opacity-50" />
          <div className="absolute bottom-2 right-2 w-12 h-12 border-b-2 border-r-2 border-[#d4af37] opacity-50" />

          <CardContent className="p-8 sm:p-12 relative z-10">
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center">
                <div className="p-4 bg-[#d4af37]/20 border-2 border-[#d4af37] clip-hexagon">
                  <Sparkles className="w-12 h-12 text-[#d4af37]" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-bold text-[#f4c430]" style={{ fontFamily: 'Cinzel, serif' }}>
                  Start Asking Questions
                </h3>
                <p className="text-[#d4af37]/80" style={{ fontFamily: 'Philosopher, serif' }}>
                  Explore the magical world of Harry Potter through AI-powered question answering
                </p>
              </div>

              <Button
                size="lg"
                className="bg-[#d4af37] hover:bg-[#f4c430] text-[#0a0e27] text-lg px-8 py-6 font-bold border-2 border-[#d4af37] transition-all"
                style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}
                onClick={() => navigate('/ask')}
              >
                Ask a Question
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-[#1a1d3a]/80 backdrop-blur-sm border-[#d4af37]/30 hover:border-[#d4af37] transition-all">
            <CardContent className="p-6 text-center space-y-3">
              <Database className="w-10 h-10 mx-auto text-[#d4af37]" />
              <h4 className="font-semibold text-lg text-[#f4c430]" style={{ fontFamily: 'Cinzel, serif' }}>Hybrid Search</h4>
              <p className="text-sm text-[#d4af37]/70" style={{ fontFamily: 'Philosopher, serif' }}>
                Combines semantic vector search (FAISS) with keyword matching (BM25)
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1d3a]/80 backdrop-blur-sm border-[#d4af37]/30 hover:border-[#d4af37] transition-all">
            <CardContent className="p-6 text-center space-y-3">
              <Brain className="w-10 h-10 mx-auto text-[#d4af37]" />
              <h4 className="font-semibold text-lg text-[#f4c430]" style={{ fontFamily: 'Cinzel, serif' }}>Local LLM</h4>
              <p className="text-sm text-[#d4af37]/70" style={{ fontFamily: 'Philosopher, serif' }}>
                Generates grounded answers using EXAONE 3.5 based on retrieved evidence
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1d3a]/80 backdrop-blur-sm border-[#d4af37]/30 hover:border-[#d4af37] transition-all">
            <CardContent className="p-6 text-center space-y-3">
              <BookOpen className="w-10 h-10 mx-auto text-[#d4af37]" />
              <h4 className="font-semibold text-lg text-[#f4c430]" style={{ fontFamily: 'Cinzel, serif' }}>Source Tracking</h4>
              <p className="text-sm text-[#d4af37]/70" style={{ fontFamily: 'Philosopher, serif' }}>
                Every answer includes references to the original Harry Potter book sources
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
