import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  mockUseDocHandle: vi.fn(() => ({})),
  mockUsePresence: vi.fn(),
  mockUseThrottledCallback: vi.fn((fn: (...args: any[]) => void) => fn),
  mockValidate: vi.fn((): string[] => []),
}));

vi.mock('@automerge/react', () => ({
  useDocHandle: mocks.mockUseDocHandle,
  useDocument: () => [{ $schema: 'https://schema.probability.nz/v1/schema.json' }, vi.fn()],
  usePresence: mocks.mockUsePresence,
}));

vi.mock('./useSchema', () => ({
  useSchema: () => ({}),
}));

vi.mock('@tanstack/react-pacer', () => ({
  useThrottledCallback: mocks.mockUseThrottledCallback,
}));

vi.mock('@probability-nz/lib', () => ({
  validate: mocks.mockValidate,
}));

import { usePresenceState } from './usePresenceState';

interface TestState { cursor: string | undefined; op: string | undefined }

const INITIAL_STATE: TestState = { cursor: undefined, op: undefined };

describe('usePresenceState', () => {
  const mockBroadcastKey = vi.fn();
  const mockPeerStates = { getStates: vi.fn(() => ({})) };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockValidate.mockReturnValue([]);
    mocks.mockUsePresence.mockReturnValue({
      peerStates: mockPeerStates,
      update: mockBroadcastKey,
      localState: undefined,
      start: vi.fn(),
      stop: vi.fn(),
    });
  });

  it('passes docUrl and suspense to useDocHandle', () => {
    renderHook(() =>
      usePresenceState('automerge:abc' as any, { initialState: INITIAL_STATE }),
    );

    expect(mocks.mockUseDocHandle).toHaveBeenCalledWith('automerge:abc', { suspense: true });
  });

  it('passes initialState and presence config to usePresence', () => {
    renderHook(() =>
      usePresenceState('automerge:abc' as any, {
        initialState: INITIAL_STATE,
        heartbeatMs: 5000,
        peerTtlMs: 10000,
      }),
    );

    expect(mocks.mockUsePresence).toHaveBeenCalledWith(
      expect.objectContaining({
        initialState: INITIAL_STATE,
        heartbeatMs: 5000,
        peerTtlMs: 10000,
      }),
    );
  });

  it('returns localState store, update, and peerStates', () => {
    const { result } = renderHook(() =>
      usePresenceState('automerge:abc' as any, { initialState: INITIAL_STATE }),
    );

    expect(result.current.localState.state).toEqual(INITIAL_STATE);
    expect(typeof result.current.update).toBe('function');
    expect(result.current.peerStates).toBe(mockPeerStates);
  });

  it('update applies updater to local state', () => {
    const { result } = renderHook(() =>
      usePresenceState<TestState>('automerge:abc' as any, { initialState: INITIAL_STATE }),
    );

    act(() => {
      result.current.update(prev => ({ ...prev, cursor: 'focused' }));
    });

    expect(result.current.localState.state).toEqual({ cursor: 'focused', op: undefined });
  });

  it('update broadcasts only changed keys', () => {
    const { result } = renderHook(() =>
      usePresenceState<TestState>('automerge:abc' as any, { initialState: INITIAL_STATE }),
    );

    act(() => {
      result.current.update(prev => ({ ...prev, cursor: 'focused' }));
    });

    expect(mockBroadcastKey).toHaveBeenCalledWith('cursor', 'focused');
    expect(mockBroadcastKey).not.toHaveBeenCalledWith('op', expect.anything());
  });

  it('does not broadcast unchanged keys', () => {
    const { result } = renderHook(() =>
      usePresenceState<TestState>('automerge:abc' as any, { initialState: INITIAL_STATE }),
    );

    act(() => {
      result.current.update(prev => prev);
    });

    expect(mockBroadcastKey).not.toHaveBeenCalled();
  });

  it('configures throttle with tickRate', () => {
    renderHook(() =>
      usePresenceState('automerge:abc' as any, {
        initialState: INITIAL_STATE,
        tickRate: 30,
      }),
    );

    expect(mocks.mockUseThrottledCallback).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        wait: 1000 / 30,
        leading: true,
        trailing: true,
      }),
    );
  });

  it('uses default tickRate of 15', () => {
    renderHook(() =>
      usePresenceState('automerge:abc' as any, { initialState: INITIAL_STATE }),
    );

    expect(mocks.mockUseThrottledCallback).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        wait: 1000 / 15,
      }),
    );
  });

  it('throws on invalid presence state', () => {
    mocks.mockValidate.mockReturnValue(['invalid cursor']);

    const { result } = renderHook(() =>
      usePresenceState<TestState>('automerge:abc' as any, { initialState: INITIAL_STATE }),
    );

    expect(() => {
      act(() => {
        result.current.update(prev => ({ ...prev, cursor: 'invalid' }));
      });
    }).toThrow('Schema validation failed');
  });

  it('does not update state when validation fails', () => {
    mocks.mockValidate.mockReturnValue(['invalid']);

    const { result } = renderHook(() =>
      usePresenceState<TestState>('automerge:abc' as any, { initialState: INITIAL_STATE }),
    );

    try {
      act(() => {
        result.current.update(prev => ({ ...prev, cursor: 'invalid' }));
      });
    } catch {
      // expected
    }

    expect(result.current.localState.state).toEqual(INITIAL_STATE);
    expect(mockBroadcastKey).not.toHaveBeenCalled();
  });

  it('validates the new state, not the previous state', () => {
    const { result } = renderHook(() =>
      usePresenceState<TestState>('automerge:abc' as any, { initialState: INITIAL_STATE }),
    );

    act(() => {
      result.current.update(prev => ({ ...prev, cursor: 'new-value' }));
    });

    expect(mocks.mockValidate).toHaveBeenCalledWith(expect.anything(), { cursor: 'new-value', op: undefined }, 'PresenceState');
  });

  it('does not throw on valid presence state', () => {
    mocks.mockValidate.mockReturnValue([]);

    const { result } = renderHook(() =>
      usePresenceState<TestState>('automerge:abc' as any, { initialState: INITIAL_STATE }),
    );

    expect(() => {
      act(() => {
        result.current.update(prev => ({ ...prev, cursor: 'valid' }));
      });
    }).not.toThrow();
  });
});
