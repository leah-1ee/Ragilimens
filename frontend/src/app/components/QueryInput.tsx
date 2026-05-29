import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Search, X, Lightbulb } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface QueryInputProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  onClear: () => void;
  isProcessing: boolean;
  errorMessage?: string;
}

const exampleQuestions = [
  'Who is Dudley?',
  'What is the Triwizard Tournament?',
  'Who helped Harry in the first task?',
  'What happened at the Ministry of Magic?',
];

export function QueryInput({ query, onQueryChange, onSearch, onClear, isProcessing, errorMessage }: QueryInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      onSearch();
    }
  };

  return (
    <Card className="shadow-lg bg-[#1a1d3a] border-2 border-[#d4af37]/30 relative overflow-hidden">
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#d4af37] opacity-20" />
      <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-[#d4af37] opacity-20" />

      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#f4c430]" style={{ fontFamily: 'Cinzel, serif' }}>
          <Search className="w-5 h-5 text-[#d4af37]" />
          Ask a Question
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 relative z-10">
        <Textarea
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Example: Who is Dudley?"
          className="min-h-[100px] text-base resize-none bg-[#0a0e27] border-[#d4af37]/30 text-[#d4af37] placeholder:text-[#d4af37]/40 focus:border-[#d4af37]"
          style={{ fontFamily: 'Philosopher, serif' }}
          disabled={isProcessing}
        />

        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <Lightbulb className="w-4 h-4 text-[#d4af37]" />
          <span className="text-sm text-[#d4af37]/70" style={{ fontFamily: 'Philosopher, serif' }}>Example questions:</span>
          {exampleQuestions.map((q, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              onClick={() => onQueryChange(q)}
              disabled={isProcessing}
              className="text-xs border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/20 hover:border-[#d4af37]"
              style={{ fontFamily: 'Philosopher, serif' }}
            >
              {q}
            </Button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onSearch}
            disabled={isProcessing || !query.trim()}
            className="flex-1 bg-[#d4af37] hover:bg-[#f4c430] text-[#0a0e27] border-2 border-[#d4af37] font-bold"
            style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.05em' }}
          >
            <Search className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Search & Generate Answer</span>
            <span className="sm:hidden">Search</span>
          </Button>
          <Button
            onClick={onClear}
            variant="outline"
            disabled={isProcessing}
            className="sm:w-auto border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/20 hover:border-[#d4af37]"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            <X className="w-4 h-4 sm:mr-2" />
            <span className="sm:inline">Clear</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
