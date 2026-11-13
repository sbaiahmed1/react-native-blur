export type RunPhase = 'idle' | 'running' | 'done' | 'stopped';
export type RunEvent = 'start' | 'finish' | 'stop';

/** A run moves idle, running, then done or stopped. A stopped run never records a result. */
export function nextPhase(phase: RunPhase, event: RunEvent): RunPhase {
  if (event === 'start') return phase === 'idle' ? 'running' : phase;
  if (phase !== 'running') return phase;
  return event === 'finish' ? 'done' : 'stopped';
}
