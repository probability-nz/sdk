import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockUseAutomergeDocument } = vi.hoisted(() => ({
  mockUseAutomergeDocument: vi.fn(),
}));
vi.mock('@automerge/react', () => ({
  useDocument: mockUseAutomergeDocument,
}));
vi.mock('./useSchema', () => ({
  useSchema: () => ({}),
}));

import { SCHEMA_VERSION } from '@probability-nz/types';
import { useProbDocument } from './useProbDocument';

const VALID_STATE = {
  $schema: SCHEMA_VERSION,
  children: [],
  templates: {},
};

describe('useProbDocument', () => {
  const mockChangeDoc = vi.fn((fn: (d: Record<string, unknown>) => void) => {
    // Simulate automerge: call the change function with a mutable proxy
    // If the function throws, the transaction is discarded
    const draft = { ...currentDoc };
    fn(draft);
    currentDoc = draft;
  });

  let currentDoc: Record<string, unknown> = {};

  beforeEach(() => {
    currentDoc = { ...VALID_STATE };
    mockChangeDoc.mockClear();
    mockUseAutomergeDocument.mockImplementation(() => [currentDoc, mockChangeDoc]);
  });

  it('returns [doc, changeDoc] like automerge useDocument', () => {
    mockUseAutomergeDocument.mockReturnValue([currentDoc, mockChangeDoc]);

    const { result } = renderHook(() =>
      useProbDocument<Record<string, unknown> & { $schema: string }>('automerge:abc' as any),
    );

    const [doc, changeDoc] = result.current;
    expect(doc).toEqual(VALID_STATE);
    expect(typeof changeDoc).toBe('function');
  });

  it('passes id with suspense to automerge useDocument', () => {
    renderHook(() => useProbDocument('automerge:xyz' as any));

    expect(mockUseAutomergeDocument).toHaveBeenCalledWith('automerge:xyz', { suspense: true });
  });

  it('allows valid writes through', () => {
    mockUseAutomergeDocument.mockReturnValue([currentDoc, mockChangeDoc]);

    const { result } = renderHook(() =>
      useProbDocument<Record<string, unknown> & { $schema: string }>('automerge:abc' as any),
    );

    act(() => {
      result.current[1]((d) => {
        (d as any).children = [{ name: 'token', position: [0, 1, 2] }];
      });
    });

    expect(mockChangeDoc).toHaveBeenCalledTimes(1);
  });

  it('rejects writes with extra properties', () => {
    const throwingChangeDoc = vi.fn((fn: (d: Record<string, unknown>) => void) => {
      const draft = { ...VALID_STATE } as Record<string, unknown>;
      fn(draft);
    });
    mockUseAutomergeDocument.mockReturnValue([currentDoc, throwingChangeDoc]);

    const { result } = renderHook(() =>
      useProbDocument<Record<string, unknown> & { $schema: string }>('automerge:abc' as any),
    );

    expect(() => {
      act(() => {
        result.current[1]((d) => {
          d.score = 42;
        });
      });
    }).toThrow('Schema validation failed');
  });

  it('allows writes with valid game state fields', () => {
    mockUseAutomergeDocument.mockReturnValue([currentDoc, mockChangeDoc]);

    const { result } = renderHook(() =>
      useProbDocument<Record<string, unknown> & { $schema: string }>('automerge:abc' as any),
    );

    act(() => {
      result.current[1]((d) => {
        (d as any).templates = { d6: { src: '/models/d6.glb' } };
        (d as any).children = [{ name: 'token', position: [0, 1, 2] }];
      });
    });

    expect(mockChangeDoc).toHaveBeenCalledTimes(1);
  });

  it('rejects writes that violate the schema', () => {
    const throwingChangeDoc = vi.fn((fn: (d: Record<string, unknown>) => void) => {
      const draft = { ...VALID_STATE } as Record<string, unknown>;
      fn(draft);
    });
    mockUseAutomergeDocument.mockReturnValue([currentDoc, throwingChangeDoc]);

    const { result } = renderHook(() =>
      useProbDocument<Record<string, unknown> & { $schema: string }>('automerge:abc' as any),
    );

    // Invalid: position must be [number, number, number]
    expect(() => {
      act(() => {
        result.current[1]((d) => {
          (d as any).children = [{ position: [1, 2] }];
        });
      });
    }).toThrow('Schema validation failed');
  });

  it('rejects writes with invalid nested structure', () => {
    const throwingChangeDoc = vi.fn((fn: (d: Record<string, unknown>) => void) => {
      const draft = { ...VALID_STATE } as Record<string, unknown>;
      fn(draft);
    });
    mockUseAutomergeDocument.mockReturnValue([currentDoc, throwingChangeDoc]);

    const { result } = renderHook(() =>
      useProbDocument<Record<string, unknown> & { $schema: string }>('automerge:abc' as any),
    );

    // Invalid: Face requires both name and rotation
    expect(() => {
      act(() => {
        result.current[1]((d) => {
          (d as any).children = [{ faces: [{ name: 'top' }] }];
        });
      });
    }).toThrow('Schema validation failed');
  });

  it('passes options to automerge changeDoc', () => {
    const changeDocWithOptions = vi.fn(
      (fn: (d: Record<string, unknown>) => void, _options?: unknown) => {
        const draft = { ...VALID_STATE } as Record<string, unknown>;
        fn(draft);
      },
    );
    mockUseAutomergeDocument.mockReturnValue([currentDoc, changeDocWithOptions]);

    const { result } = renderHook(() =>
      useProbDocument<Record<string, unknown> & { $schema: string }>('automerge:abc' as any),
    );

    const options = { message: 'test change' };
    act(() => {
      result.current[1]((d) => {
        (d as any).children = [{ name: 'updated' }];
      }, options);
    });

    expect(changeDocWithOptions).toHaveBeenCalledWith(expect.any(Function), options);
  });
});
