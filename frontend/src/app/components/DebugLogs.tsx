import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Terminal, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ScrollArea } from './ui/scroll-area';

interface DebugLogsProps {
  logs: string[];
}

export function DebugLogs({ logs }: DebugLogsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!logs || logs.length === 0) {
    return null;
  }

  const getLogColor = (log: string) => {
    if (log.includes('[ERROR]')) return 'text-red-400';
    if (log.includes('[WARN]')) return 'text-yellow-400';
    if (log.includes('[SUCCESS]')) return 'text-[#d4af37]';
    if (log.includes('[DEBUG]')) return 'text-blue-400';
    if (log.includes('[INFO]')) return 'text-[#f4c430]';
    if (log.includes('[QUERY]')) return 'text-purple-400';
    if (log.includes('[PROCESS]')) return 'text-indigo-400';
    return 'text-[#d4af37]/70';
  };

  return (
    <Card className="shadow-lg bg-[#0a0e27] border-2 border-[#d4af37]/30">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between hover:bg-[#1a1d3a] text-[#d4af37]">
              <CardTitle className="flex items-center gap-2 text-lg text-[#f4c430]" style={{ fontFamily: 'Cinzel, serif' }}>
                <Terminal className="w-5 h-5 text-[#d4af37]" />
                Debug Logs
              </CardTitle>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent>
            <ScrollArea className="h-[300px] w-full rounded-md bg-[#000000] border border-[#d4af37]/30 p-4">
              <div className="space-y-1 font-mono text-sm">
                {logs.map((log, index) => (
                  <div key={index} className={`${getLogColor(log)}`}>
                    {log}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
