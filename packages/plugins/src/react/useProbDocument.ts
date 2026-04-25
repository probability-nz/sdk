import type { ChangeFn, ChangeOptions, Doc } from "@automerge/automerge";
import { type AnyDocumentId, useDocument as useAutomergeDocument } from "@automerge/react";
import { useCallback } from "react";
import { assertGameState } from "@probability-nz/lib";
import { SCHEMA_URL } from "@probability-nz/types";
import { useSchema } from "./useSchema";

type ChangeDocFn<T> = (changeFn: ChangeFn<T>, options?: ChangeOptions<T>) => void;

/**
 * Schema-validated access to the shared game document.
 * @throws On schema validation failure.
 * @remarks Suspends until loaded.
 * @group Core
 */
export function useProbDocument<T extends { $schema: string }>(
  id: AnyDocumentId,
): [Doc<T>, ChangeDocFn<T>] {
  const [doc, rawChangeDoc] = useAutomergeDocument<T>(id, { suspense: true });
  if (!doc.$schema) {
    console.warn(`Document ${String(id)} has no $schema; defaulting to ${SCHEMA_URL}`);
  }
  const schema = useSchema(doc.$schema ?? SCHEMA_URL);

  // Validate schema before updating
  const changeDoc = useCallback(
    (fn: ChangeFn<T>, options?: ChangeOptions<T>) => {
      rawChangeDoc((d) => {
        fn(d);
        assertGameState(schema, d);
      }, options);
    },
    [rawChangeDoc, schema],
  );

  return [doc, changeDoc];
}
