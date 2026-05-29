import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Textarea } from './ui/textarea';
import type { RetrievalConfig } from '../context/RAGContext';

interface RetrievalSettingsProps {
  config: RetrievalConfig;
  onConfigChange: (config: RetrievalConfig) => void;
  disabled: boolean;
}

export function RetrievalSettings({ config, onConfigChange, disabled }: RetrievalSettingsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleMethodChange = (method: string) => {
    onConfigChange({ ...config, method: method as 'hybrid' | 'faiss' | 'bm25' });
  };

  const handleLanguageChange = (language: string) => {
    onConfigChange({ ...config, language: language as 'English' | 'Korean' });
  };

  const handleTopKChange = (delta: number) => {
    const newTopK = Math.max(1, Math.min(10, config.topK + delta));
    onConfigChange({ ...config, topK: newTopK });
  };

  const handleChunkConfigChange = (chunkConfig: string) => {
    onConfigChange({ ...config, chunkConfig });
  };

  const handleMetadataFilterChange = (metadataFilter: string) => {
    onConfigChange({ ...config, metadataFilter });
  };

  return (
    <Card className="shadow-lg bg-[#1a1d3a] border-2 border-[#d4af37]/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-[#f4c430]" style={{ fontFamily: 'Cinzel, serif' }}>
          <Settings className="w-5 h-5 text-[#d4af37]" />
          Retrieval Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-[#d4af37]" style={{ fontFamily: 'Philosopher, serif' }}>Retrieval Method</Label>
            <Select value={config.method} onValueChange={handleMethodChange} disabled={disabled}>
              <SelectTrigger className="bg-[#0a0e27] border-[#d4af37]/30 text-[#d4af37]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1d3a] border-[#d4af37]/30">
                <SelectItem value="hybrid">Hybrid (FAISS + BM25)</SelectItem>
                <SelectItem value="faiss">FAISS (Vector)</SelectItem>
                <SelectItem value="bm25">BM25 (Keyword)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[#d4af37]" style={{ fontFamily: 'Philosopher, serif' }}>Answer Language</Label>
            <Select value={config.language} onValueChange={handleLanguageChange} disabled={disabled}>
              <SelectTrigger className="bg-[#0a0e27] border-[#d4af37]/30 text-[#d4af37]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1d3a] border-[#d4af37]/30">
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Korean">Korean</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[#d4af37]" style={{ fontFamily: 'Philosopher, serif' }}>Top-K Chunks</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTopKChange(-1)}
                disabled={disabled || config.topK <= 1}
                className="border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/20"
              >
                -
              </Button>
              <span className="flex-1 text-center font-semibold text-[#d4af37]">{config.topK}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTopKChange(1)}
                disabled={disabled || config.topK >= 10}
                className="border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/20"
              >
                +
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#d4af37]" style={{ fontFamily: 'Philosopher, serif' }}>Chunk Config</Label>
            <Select value={config.chunkConfig} onValueChange={handleChunkConfigChange} disabled={disabled}>
              <SelectTrigger className="bg-[#0a0e27] border-[#d4af37]/30 text-[#d4af37]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1d3a] border-[#d4af37]/30">
                <SelectItem value="structure_text_512">structure_text_512</SelectItem>
                <SelectItem value="fixed">fixed</SelectItem>
                <SelectItem value="line">line</SelectItem>
                <SelectItem value="token">token</SelectItem>
                <SelectItem value="structure_code">structure_code</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between text-[#d4af37] hover:bg-[#d4af37]/20" style={{ fontFamily: 'Cinzel, serif' }}>
              Advanced Settings
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-2">
            <Label className="text-[#d4af37]" style={{ fontFamily: 'Philosopher, serif' }}>Metadata Filter (JSON)</Label>
            <Textarea
              value={config.metadataFilter || ''}
              onChange={(e) => handleMetadataFilterChange(e.target.value)}
              placeholder='{"source_file": "Book4.txt"}'
              className="font-mono text-sm bg-[#0a0e27] border-[#d4af37]/30 text-[#d4af37] placeholder:text-[#d4af37]/40"
              disabled={disabled}
            />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
