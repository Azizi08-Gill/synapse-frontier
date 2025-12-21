import React, { useEffect, useRef } from 'react';
import { LogEntry } from '@/hooks/usePathfinder';
import { cn } from '@/lib/utils';
import { Terminal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AgentLogProps {
  logs: LogEntry[];
  onClear: () => void;
}

const AgentLog: React.FC<AgentLogProps> = ({ logs, onClear }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return 'text-accent';
      case 'warning': return 'text-secondary';
      case 'algorithm': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="neo-panel p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          <h3 className="font-display text-sm text-primary neo-text-glow tracking-widest">
            AGENT THOUGHT PROCESS
          </h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClear}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      {/* Log entries */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-cyber space-y-1 font-mono text-xs"
      >
        {logs.length === 0 ? (
          <div className="text-muted-foreground italic text-center py-8">
            <p>No logs yet.</p>
            <p className="mt-1">Run an algorithm to see the thought process.</p>
          </div>
        ) : (
          logs.map((log, index) => (
            <div 
              key={index}
              className={cn(
                "flex gap-2 py-0.5 animate-fade-up",
                getLogColor(log.type)
              )}
              style={{ animationDelay: `${index * 10}ms` }}
            >
              <span className="text-muted-foreground/70 shrink-0">
                [{log.timestamp}]
              </span>
              <span className="break-all">{log.message}</span>
            </div>
          ))
        )}
      </div>

      {/* Status bar */}
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>{logs.length} entries</span>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span>Live</span>
        </div>
      </div>
    </div>
  );
};

export default AgentLog;
