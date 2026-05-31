import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Progress } from './ui/progress';
import { Send, Database, Sparkles, CheckCircle2 } from 'lucide-react';
import { useRAG } from '../context/RAGContext';

interface ProcessingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProcessingDialog({
  open,
  onOpenChange,
}: ProcessingDialogProps) {
  const {
    processingState,
    processingProgress,
    processingMessage,
  } = useRAG();

  const stateConfig = {
    idle: {
      label: 'Waiting for your question...',
      icon: Send,
    },
    queued: {
      label: 'Sending query to the RAG backend...',
      icon: Send,
    },
    retrieving: {
      label: 'Retrieving evidence from FAISS and BM25...',
      icon: Database,
    },
    generating: {
      label: 'Generating a grounded answer with the local LLM...',
      icon: Sparkles,
    },
    completed: {
      label: 'Answer generated successfully.',
      icon: CheckCircle2,
    },
    error: {
      label: 'An error occurred while processing the question.',
      icon: Send,
    },
  };

  const config = stateConfig[processingState];
  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent className="sm:max-w-md [&>button]:hidden bg-[#080b24]/88 backdrop-blur-md border-2 border-[#d4af37]/70 shadow-2xl">
        <DialogHeader>
          <DialogTitle
            className="text-center text-xl text-[#f4c430]"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            Processing Your Question
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {processingState !== 'completed' && (
                <div className="absolute inset-0 animate-ping">
                  <Icon className="w-16 h-16 text-[#d4af37] opacity-20" />
                </div>
              )}

              <Icon
                className={`w-16 h-16 text-[#d4af37] ${
                  processingState === 'completed' ? '' : 'animate-pulse'
                }`}
              />
            </div>

            <p
              className="text-center font-medium text-[#d4af37]"
              style={{ fontFamily: 'Philosopher, serif' }}
            >
              {processingMessage || config.label}
            </p>
          </div>

          <div className="space-y-3">
            <Progress value={processingProgress} className="h-2" />

            <div className="flex justify-between text-xs text-[#d4af37]/70">
              <div className="flex items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    processingState !== 'idle'
                      ? 'bg-[#d4af37]'
                      : 'bg-[#d4af37]/20'
                  }`}
                />
                <span>Query</span>
              </div>

              <div className="flex items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    processingState === 'retrieving' ||
                    processingState === 'generating' ||
                    processingState === 'completed'
                      ? 'bg-[#d4af37]'
                      : 'bg-[#d4af37]/20'
                  }`}
                />
                <span>Retrieve</span>
              </div>

              <div className="flex items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    processingState === 'generating' ||
                    processingState === 'completed'
                      ? 'bg-[#d4af37]'
                      : 'bg-[#d4af37]/20'
                  }`}
                />
                <span>Generate</span>
              </div>

              <div className="flex items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    processingState === 'completed'
                      ? 'bg-[#d4af37]'
                      : 'bg-[#d4af37]/20'
                  }`}
                />
                <span>Answer</span>
              </div>
            </div>
          </div>

          <div
            className="text-center text-sm text-[#d4af37]/70"
            style={{ fontFamily: 'Philosopher, serif' }}
          >
            {processingProgress}% complete
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
