import type { ChangeFn, ChangeOptions, Doc } from "@automerge/automerge";
import { type AnyDocumentId, useDocument as useAutomergeDocument } from "@automerge/react";
import { useCallback } from "react";
import { assertGameState } from "@probability-nz/lib";
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
  const schema = useSchema(doc.$schema);

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
