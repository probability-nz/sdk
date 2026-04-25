import { type Doc, type Prop, getObjectId } from "@automerge/automerge";

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

/**
 * Find the path to an object in an Automerge document by its ID.
 * @experimental Will be removed when Automerge adds native support.
 * @group Advanced
 */
export function objectIdToPath(doc: Doc<unknown>, objId: string): Prop[] | undefined {
  // Mutable depth-first search: single shared array with push/pop avoids allocations per step.
  const path: Prop[] = [];

  function walk(node: unknown): boolean {
    if (getObjectId(node) === objId) {
      return true;
    }
    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        path.push(i);
        if (walk(node[i])) {
          return true;
        }
        path.pop();
      }
      return false;
    }
    if (isRecord(node)) {
      for (const key of Object.keys(node)) {
        path.push(key);
        if (walk(node[key])) {
          return true;
        }
        path.pop();
      }
    }
    return false;
  }

  return walk(doc) ? path : undefined;
}
