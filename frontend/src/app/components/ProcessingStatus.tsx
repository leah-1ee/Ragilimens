import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Loader2, Search, Database, Sparkles, CheckCircle2 } from 'lucide-react';
import type { ProcessingState } from '../context/RAGContext';

interface ProcessingStatusProps {
  state: ProcessingState;
}

const stateConfig = {
  idle: {
    label: 'Ready to search',
    icon: Search,
    progress: 0,
    color: 'text-gray-500',
  },
  searching: {
    label: 'Searching relevant document chunks...',
    icon: Loader2,
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
  completed: {
    label: 'Answer generated successfully',
    icon: CheckCircle2,
    progress: 100,
    color: 'text-green-500',
  },
  error: {
    label: 'Failed to generate answer',
    icon: Search,
    progress: 0,
    color: 'text-red-500',
  },
};

export function ProcessingStatus({ state }: ProcessingStatusProps) {
  const config = stateConfig[state];
  const Icon = config.icon;
  const isAnimating = state !== 'idle' && state !== 'completed' && state !== 'error';

  return (
    <Card className="shadow-lg border-2 border-indigo-200">
      <CardContent className="py-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Icon className={`w-5 h-5 ${config.color} ${isAnimating ? 'animate-spin' : ''}`} />
            <span className={`font-medium ${config.color}`}>{config.label}</span>
          </div>

          <div className="space-y-2">
            <Progress value={config.progress} className="h-2" />

            <div className="flex justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${state === 'searching' || state === 'retrieving' || state === 'generating' || state === 'completed' ? 'bg-indigo-500' : 'bg-gray-300'}`} />
                <span>Query</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${state === 'retrieving' || state === 'generating' || state === 'completed' ? 'bg-indigo-500' : 'bg-gray-300'}`} />
                <span>Retrieve</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${state === 'generating' || state === 'completed' ? 'bg-indigo-500' : 'bg-gray-300'}`} />
                <span>Generate</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${state === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span>Answer</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
