import { nextPhase } from '../run-phase';

it('starts from idle only', () => {
  expect(nextPhase('idle', 'start')).toBe('running');
  expect(nextPhase('done', 'start')).toBe('done');
  expect(nextPhase('stopped', 'start')).toBe('stopped');
});

it('finishes a running run', () => {
  expect(nextPhase('running', 'finish')).toBe('done');
});

it('stops a running run, so no result is recorded', () => {
  expect(nextPhase('running', 'stop')).toBe('stopped');
});

it('ignores a finish that lands after a stop', () => {
  expect(nextPhase('stopped', 'finish')).toBe('stopped');
});

it('ignores a stop once the run is over', () => {
  expect(nextPhase('idle', 'stop')).toBe('idle');
  expect(nextPhase('done', 'stop')).toBe('done');
});
