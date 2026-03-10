import { describe, expect, it } from "vitest";
import { parseHashContext } from "./parseHashContext";

const validContext = {
  doc: "automerge:abc123" as const,
  sync: ["wss://sync.example.com"] as [string, ...string[]],
};

const encode = (obj: unknown) => `#${encodeURIComponent(JSON.stringify(obj))}`;

describe("parseHashContext", () => {
  it("parses a valid hash context", () => {
    expect(parseHashContext(encode(validContext))).toEqual(validContext);
  });

  it("returns undefined for empty hash", () => {
    expect(parseHashContext("")).toBeUndefined();
    expect(parseHashContext("#")).toBeUndefined();
  });

  it("returns undefined for invalid JSON", () => {
    expect(parseHashContext("#not-json")).toBeUndefined();
  });

  it("returns undefined for malformed URI encoding", () => {
    expect(parseHashContext("#%invalid")).toBeUndefined();
  });

  it("preserves optional delegation field", () => {
    const withDelegation = { ...validContext, delegation: "some-token" };
    expect(parseHashContext(encode(withDelegation))).toEqual(withDelegation);
  });
});
