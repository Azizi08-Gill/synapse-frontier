import React from 'react';
import { Cpu, Github, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
  return (
    <header className="h-16 neo-panel rounded-none border-x-0 border-t-0 flex items-center justify-between px-6">
      {/* Logo and Title */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/50 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-primary" />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent animate-pulse" />
        </div>

        <div>
          <h1 className="font-display text-xl tracking-wider text-foreground">
            <span className="text-primary neo-text-glow">SYNAPSE</span>
            <span className="text-secondary opacity-0 animate-pulse"> </span>
            <span>FRONTIER</span>
          </h1>
          <p className="text-xs text-muted-foreground tracking-widest uppercase">
            Smart Grid 2025 • Urban Meta-Simulator
          </p>
        </div>
      </div>

      {/* Status indicators */}
      <div className="hidden md:flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            System Online
          </span>
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="text-xs text-muted-foreground font-mono">
          v1.0.0-alpha
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" title="About">
          <Info className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
