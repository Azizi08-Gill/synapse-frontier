import { useState, useCallback } from 'react';

export type AgentType = 'reflex' | 'goal' | 'utility';

export interface Agent {
  id: string;
  type: AgentType;
  name: string;
  position: { x: number; y: number };
  target: { x: number; y: number } | null;
  speed: number;
  fuel: number;
  maxFuel: number;
  active: boolean;
  color: string;
}

const agentColors: Record<AgentType, string> = {
  reflex: 'hsl(var(--primary))',
  goal: 'hsl(var(--accent))',
  utility: 'hsl(var(--secondary))',
};

const agentNames: Record<AgentType, string> = {
  reflex: 'Reflex Car',
  goal: 'Delivery Drone',
  utility: 'Smart Ambulance',
};

export const useAgents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);

  const spawnAgent = useCallback((type: AgentType, position: { x: number; y: number }) => {
    const newAgent: Agent = {
      id: `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      name: agentNames[type],
      position,
      target: null,
      speed: type === 'reflex' ? 1 : type === 'goal' ? 2 : 1.5,
      fuel: 100,
      maxFuel: 100,
      active: true,
      color: agentColors[type],
    };
    
    setAgents(prev => [...prev, newAgent]);
    return newAgent;
  }, []);

  const removeAgent = useCallback((id: string) => {
    setAgents(prev => prev.filter(agent => agent.id !== id));
  }, []);

  const updateAgentPosition = useCallback((id: string, position: { x: number; y: number }) => {
    setAgents(prev => prev.map(agent => 
      agent.id === id ? { ...agent, position } : agent
    ));
  }, []);

  const setAgentTarget = useCallback((id: string, target: { x: number; y: number }) => {
    setAgents(prev => prev.map(agent => 
      agent.id === id ? { ...agent, target } : agent
    ));
  }, []);

  const toggleAgent = useCallback((id: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === id ? { ...agent, active: !agent.active } : agent
    ));
  }, []);

  const clearAgents = useCallback(() => {
    setAgents([]);
  }, []);

  return {
    agents,
    spawnAgent,
    removeAgent,
    updateAgentPosition,
    setAgentTarget,
    toggleAgent,
    clearAgents,
  };
};
