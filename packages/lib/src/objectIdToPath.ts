import { type Doc, type Prop, getObjectId } from "@automerge/automerge";

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
    if (node === null || typeof node !== "object") {
      return false;
    }

    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        path.push(i);
        if (walk(node[i])) {
          return true;
        }
        path.pop();
      }
    } else {
      for (const key of Object.keys(node)) {
        path.push(key);
        if (walk((node as Record<string, unknown>)[key])) {
          return true;
        }
        path.pop();
      }
    }
    return false;
  }

  return walk(doc) ? path : undefined;
}
