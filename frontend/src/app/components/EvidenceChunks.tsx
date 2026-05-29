import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { FileText, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { toast } from 'sonner';
import type { DocumentChunk } from '../context/RAGContext';

interface EvidenceChunksProps {
  docs: DocumentChunk[];
}

function ChunkCard({ chunk, index }: { chunk: DocumentChunk; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const preview = chunk.text.substring(0, 200);
  const hasMore = chunk.text.length > 200;

  const handleCopy = () => {
    navigator.clipboard.writeText(chunk.text);
    toast.success('Chunk copied to clipboard');
  };

  return (
    <Card className="border-l-4 border-l-[#d4af37] bg-[#1a1d3a] border-[#d4af37]/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-base flex items-center gap-2 text-[#f4c430]" style={{ fontFamily: 'Cinzel, serif' }}>
              <FileText className="w-4 h-4 text-[#d4af37]" />
              Chunk #{index + 1}
            </CardTitle>
            <Badge variant="outline" className="bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]">
              {chunk.source_file}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={handleCopy} className="text-[#d4af37] hover:bg-[#d4af37]/20">
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm leading-relaxed">
          <p className="text-[#d4af37]/70 font-medium mb-2" style={{ fontFamily: 'Philosopher, serif' }}>Preview:</p>
          <p className="whitespace-pre-wrap text-[#d4af37]" style={{ fontFamily: 'Philosopher, serif' }}>
            {isExpanded ? chunk.text : preview}
            {!isExpanded && hasMore && '...'}
          </p>
        </div>

        {hasMore && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full text-[#d4af37] hover:bg-[#d4af37]/20">
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    View Full Chunk
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}

export function EvidenceChunks({ docs }: EvidenceChunksProps) {
  if (!docs || docs.length === 0) {
    return (
      <Card className="shadow-lg border-2 border-dashed border-[#d4af37]/30 bg-[#1a1d3a]">
        <CardContent className="py-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-[#d4af37]/40 mb-3" />
          <p className="text-[#d4af37]/60" style={{ fontFamily: 'Philosopher, serif' }}>
            Retrieved chunks will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold flex items-center gap-2 text-[#f4c430]" style={{ fontFamily: 'Cinzel, serif' }}>
        <FileText className="w-6 h-6 text-[#d4af37]" />
        Retrieved Evidence Chunks
      </h2>
      <div className="grid gap-4">
        {docs.map((chunk, index) => (
          <ChunkCard key={index} chunk={chunk} index={index} />
        ))}
      </div>
    </div>
  );
}
