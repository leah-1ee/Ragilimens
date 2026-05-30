import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { BookOpen } from 'lucide-react';

interface ReferenceListProps {
  sources: string[];
}

export function ReferenceList({ sources }: ReferenceListProps) {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-lg bg-[#080b24]/64 backdrop-blur-md border-2 border-[#d4af37]/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#f4c430]" style={{ fontFamily: 'Cinzel, serif' }}>
          <BookOpen className="w-5 h-5 text-[#d4af37]" />
          Reference List
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sources.map((source, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-[#0a0e27] rounded-lg border border-[#d4af37]/30">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37] font-semibold text-sm">
                {index + 1}
              </div>
              <Badge variant="outline" className="text-sm bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]">
                {source}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
