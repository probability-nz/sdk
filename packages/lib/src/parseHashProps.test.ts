import { describe, expect, it } from "vitest";
import { parseHashProps } from "./parseHashProps";

const validContext = {
  doc: "automerge:abc123" as const,
  sync: ["wss://sync.example.com"] as [string, ...string[]],
};

const encode = (obj: unknown) => `#${encodeURIComponent(JSON.stringify(obj))}`;

describe("parseHashProps", () => {
  it("parses a valid hash context", () => {
    expect(parseHashProps(encode(validContext))).toEqual(validContext);
  });

  it("returns undefined for empty hash", () => {
    expect(parseHashProps("")).toBeUndefined();
    expect(parseHashProps("#")).toBeUndefined();
  });

  it("returns undefined for invalid JSON", () => {
    expect(parseHashProps("#not-json")).toBeUndefined();
  });

  it("returns undefined for malformed URI encoding", () => {
    expect(parseHashProps("#%invalid")).toBeUndefined();
  });

  it("preserves optional delegation field", () => {
    const withDelegation = { ...validContext, delegation: "some-token" };
    expect(parseHashProps(encode(withDelegation))).toEqual(withDelegation);
  });
});
