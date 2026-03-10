import { describe, expect, it } from "vitest";
import { from, getObjectId } from "@automerge/automerge";
import { objectIdToPath } from "./objectIdToPath";

describe("objectIdToPath", () => {
  it("finds a nested piece by its Automerge ID", () => {
    const doc = from({ children: [{ template: "pawn" }, { template: "king" }] });
    const targetId = getObjectId(doc.children[1]!)!;

    expect(objectIdToPath(doc, targetId)).toEqual(["children", 1]);
  });

  it("returns empty array for the root object", () => {
    const doc = from({ x: 1 });
    const rootId = getObjectId(doc)!;

    expect(objectIdToPath(doc, rootId)).toEqual([]);
  });

  it("returns undefined for a non-existent ID", () => {
    const doc = from({ x: 1 });
    expect(objectIdToPath(doc, "99@nonexistent")).toBeUndefined();
  });

  it("traverses deeply nested pieces", () => {
    const doc = from({ children: [{ template: "group", children: [{ template: "pawn" }] }] });
    const targetId = getObjectId(doc.children[0]!.children[0]!)!;

    expect(objectIdToPath(doc, targetId)).toEqual(["children", 0, "children", 0]);
  });

  it("distinguishes siblings in an array", () => {
    const doc = from({ children: [{ template: "pawn" }, { template: "king" }, { template: "rook" }] });
    const id0 = getObjectId(doc.children[0]!)!;
    const id2 = getObjectId(doc.children[2]!)!;

    expect(objectIdToPath(doc, id0)).toEqual(["children", 0]);
    expect(objectIdToPath(doc, id2)).toEqual(["children", 2]);
  });

});
