import {
  type AnyDocumentId,
  type PresenceConfig,
  type PresenceState,
  useDocument as useAutomergeDocument,
  useDocHandle,
  usePresence,
} from "@automerge/react";
import { useCallback, useRef, useState } from "react";
import { Store } from "@tanstack/store";
import { useThrottledCallback } from "@tanstack/react-pacer";
import { assertPresenceState } from "@probability-nz/lib";
import { SCHEMA_URL } from "@probability-nz/types";
import type { ImportMetaWithEnv } from "./schemaValidation";
import { useSchema } from "./useSchema";

declare const process: { env?: { NODE_ENV?: string } } | undefined;

const DEFAULT_TICK_RATE = 15;
const useValidationSchema = (
  (import.meta as ImportMetaWithEnv).env?.DEV ??
  ((import.meta as ImportMetaWithEnv).env?.PROD === true
    ? false
    : typeof process === "undefined" || process.env?.NODE_ENV !== "production")
)
  ? useSchema
  : () => undefined;

type UsePresenceStateOptions<T extends PresenceState> = PresenceConfig<T> & {
  tickRate?: number;
};

/**
 * Share ephemeral state with peers (e.g. cursors, intended moves).
 * @defaultValue tickRate — {@link DEFAULT_TICK_RATE}
 * @throws On schema validation failure.
 * @remarks Suspends until loaded.
 * @group Presence
 */
export function usePresenceState<T extends PresenceState>(
  docUrl: AnyDocumentId,
  { initialState, tickRate = DEFAULT_TICK_RATE, ...presenceConfig }: UsePresenceStateOptions<T>,
) {
  const [doc] = useAutomergeDocument<{ $schema: string }>(docUrl, {
    suspense: true,
  });
  if (!doc.$schema) {
    console.warn(`Document ${String(docUrl)} has no $schema; defaulting to ${SCHEMA_URL}`);
  }
  const schema = useValidationSchema(doc.$schema ?? SCHEMA_URL);
  const handle = useDocHandle(docUrl, { suspense: true });
  const { peerStates, update: broadcastKey } = usePresence<T>({
    handle,
    initialState,
    ...presenceConfig,
  });
  const [localState] = useState(() => new Store<T>(initialState));
  const lastBroadcast = useRef(initialState);

  const broadcast = useThrottledCallback(
    () => {
      const prev = lastBroadcast.current;
      const next = localState.state;
      lastBroadcast.current = next;

      // Only broadcast changed keys
      (Object.keys(next) as (keyof T & string)[])
        .filter((key) => next[key] !== prev[key])
        .forEach((key) => {
          broadcastKey(key, next[key]);
        });
    },
    { wait: 1000 / tickRate, leading: true, trailing: true },
  );

  // Validate schema before broadcasting
  const update = useCallback(
    (updater: (prev: T) => T) => {
      const prev = localState.state;
      const next = updater(prev);
      if (
        (import.meta as ImportMetaWithEnv).env?.DEV ??
        ((import.meta as ImportMetaWithEnv).env?.PROD === true
          ? false
          : typeof process === "undefined" || process.env?.NODE_ENV !== "production")
      ) {
        assertPresenceState(schema!, next);
      }
      localState.setState(() => next);
      broadcast();
    },
    [localState, broadcast, schema],
  );

  return { localState, update, peerStates };
}
