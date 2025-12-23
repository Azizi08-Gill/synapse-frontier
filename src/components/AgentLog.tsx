import React, { useEffect, useRef } from 'react';
import { LogEntry } from '@/hooks/usePathfinder';
import { cn } from '@/lib/utils';
import { Hash, Trash2, FileText } from 'lucide-react';
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
      case 'success': return 'text-emerald-500 font-bold';
      case 'warning': return 'text-amber-500 font-bold';
      case 'algorithm': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="bg-card border border-border p-4 h-full flex flex-col rounded-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="font-mono text-xs font-bold text-foreground uppercase tracking-widest">
            System Event Log
          </h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-destructive/20"
          onClick={onClear}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      {/* Log entries */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-1 font-mono text-[10px]"
      >
        {logs.length === 0 ? (
          <div className="text-muted-foreground italic text-center py-8">
            <p className="opacity-50">-- NO EVENTS LOGGED --</p>
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className={cn(
                "flex gap-2 py-0.5 border-l-2 pl-2 border-transparent hover:bg-muted/30 transition-colors",
                log.type === 'success' && "border-emerald-500",
                log.type === 'warning' && "border-amber-500",
                log.type === 'algorithm' && "border-primary",
                getLogColor(log.type)
              )}
            >
              <span className="text-muted-foreground/50 shrink-0 select-none">
                {log.timestamp}
              </span>
              <span className="break-all">{log.message}</span>
            </div>
          ))
        )}
      </div>

      {/* Status bar */}
      <div className="mt-2 pt-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground uppercase">
        <div className="flex items-center gap-1">
          <Hash className="w-3 h-3" />
          <span>{logs.length} Lines</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-emerald-500">LIVE</span>
        </div>
      </div>
    </div>
  );
};

export default AgentLog;
