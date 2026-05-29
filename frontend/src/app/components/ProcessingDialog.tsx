import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Progress } from './ui/progress';
import { Loader2, Search, Database, Sparkles } from 'lucide-react';
import { useRAG } from '../context/RAGContext';

interface ProcessingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProcessingDialog({ open }: ProcessingDialogProps) {
  const { processingState } = useRAG();

  const stateConfig = {
    searching: {
      label: 'Searching relevant document chunks...',
      icon: Search,
      progress: 25,
      color: 'text-blue-500',
    },
    retrieving: {
      label: 'Retrieving evidence from FAISS + BM25...',
      icon: Database,
      progress: 50,
      color: 'text-indigo-500',
    },
    generating: {
      label: 'Generating grounded answer with local LLM...',
      icon: Sparkles,
      progress: 75,
      color: 'text-purple-500',
    },
  };

  const config = stateConfig[processingState as keyof typeof stateConfig] || stateConfig.searching;
  const Icon = config.icon;

  return (
    <Dialog open={open} modal>
      <DialogContent className="sm:max-w-md [&>button]:hidden bg-[#1a1d3a] border-2 border-[#d4af37]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl text-[#f4c430]" style={{ fontFamily: 'Cinzel, serif' }}>
            Processing Your Question
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 animate-ping">
                <Icon className={`w-16 h-16 text-[#d4af37] opacity-20`} />
              </div>
              <Icon className={`w-16 h-16 text-[#d4af37] animate-pulse`} />
            </div>

            <p className="text-center font-medium text-[#d4af37]" style={{ fontFamily: 'Philosopher, serif' }}>
              {config.label}
            </p>
          </div>

          <div className="space-y-3">
            <Progress value={config.progress} className="h-2" />

            <div className="flex justify-between text-xs text-[#d4af37]/70">
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${processingState === 'searching' || processingState === 'retrieving' || processingState === 'generating' ? 'bg-[#d4af37]' : 'bg-[#d4af37]/20'}`} />
                <span>Query</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${processingState === 'retrieving' || processingState === 'generating' ? 'bg-[#d4af37]' : 'bg-[#d4af37]/20'}`} />
                <span>Retrieve</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${processingState === 'generating' ? 'bg-[#d4af37]' : 'bg-[#d4af37]/20'}`} />
                <span>Generate</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full bg-[#d4af37]/20`} />
                <span>Answer</span>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-[#d4af37]/70" style={{ fontFamily: 'Philosopher, serif' }}>
            This may take a few moments...
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
