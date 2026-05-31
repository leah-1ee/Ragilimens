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
  'Who is Ginny Weasley?',
  'What is the Marauder\'s Map?',
  'What does the spell Expelliarmus do?',
];

export function QueryInput({
  query,
  onQueryChange,
  onSearch,
  onClear,
  isProcessing,
  errorMessage,
}: QueryInputProps) {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      onSearch();
    }
  };

  return (
    <Card className="shadow-xl bg-[#080b24]/68 backdrop-blur-md border-2 border-[#d4af37]/40 relative overflow-hidden">
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#d4af37] opacity-25" />
      <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-[#d4af37] opacity-25" />

      <CardHeader>
        <CardTitle
          className="flex items-center gap-2 text-[#f4c430]"
          style={{ fontFamily: 'Cinzel, serif' }}
        >
          <Search className="w-5 h-5 text-[#d4af37]" />
          Ask a Question
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10">
        <Textarea
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Example: Who is Dudley?"
          className="min-h-[100px] text-base resize-none bg-[#05071a]/78 border-[#d4af37]/40 text-[#f4c430] placeholder:text-[#d4af37]/45 focus:border-[#d4af37]"
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

          <span
            className="text-sm text-[#d4af37]/75"
            style={{ fontFamily: 'Philosopher, serif' }}
          >
            Example questions:
          </span>

          {exampleQuestions.map((exampleQuestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onQueryChange(exampleQuestion)}
              disabled={isProcessing}
              className="text-xs bg-[#080b24]/45 border-[#d4af37]/35 text-[#d4af37] hover:bg-[#d4af37]/20 hover:border-[#d4af37]"
              style={{ fontFamily: 'Philosopher, serif' }}
            >
              {exampleQuestion}
            </Button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onSearch}
            disabled={isProcessing || !query.trim()}
            className="flex-1 bg-[#d4af37] hover:bg-[#f4c430] text-[#0a0e27] border-2 border-[#d4af37] font-bold"
            style={{
              fontFamily: 'Cinzel, serif',
              letterSpacing: '0.05em',
            }}
          >
            <Search className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Search &amp; Generate Answer</span>
            <span className="sm:hidden">Search</span>
          </Button>

          <Button
            onClick={onClear}
            variant="outline"
            disabled={isProcessing}
            className="sm:w-auto bg-[#080b24]/45 border-[#d4af37]/35 text-[#d4af37] hover:bg-[#d4af37]/20 hover:border-[#d4af37]"
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
