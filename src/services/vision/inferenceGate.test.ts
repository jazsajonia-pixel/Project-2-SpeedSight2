import { describe, expect, it } from 'vitest';
import { InferenceGate } from './inferenceGate';

describe('InferenceGate', () => {
  it('allows one in-flight inference at a time', () => {
    const gate = new InferenceGate();

    expect(gate.tryEnter()).toBe(true);
    expect(gate.isActive()).toBe(true);
    expect(gate.tryEnter()).toBe(false);
  });

  it('allows the next inference after the current one leaves', () => {
    const gate = new InferenceGate();

    gate.tryEnter();
    gate.leave();

    expect(gate.isActive()).toBe(false);
    expect(gate.tryEnter()).toBe(true);
  });

  it('is safe to release more than once', () => {
    const gate = new InferenceGate();

    gate.leave();
    gate.leave();

    expect(gate.tryEnter()).toBe(true);
  });
});
