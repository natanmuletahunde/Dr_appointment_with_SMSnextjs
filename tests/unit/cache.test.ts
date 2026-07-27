import { describe, expect, it, beforeEach } from "vitest";
import {
  cacheGet,
  cacheInvalidate,
  cacheSet,
  cacheStats,
  cacheGetOrSet,
} from "@/lib/cache/memory-cache";

describe("memory-cache", () => {
  beforeEach(() => {
    cacheInvalidate("");
  });

  it("sets and gets values", () => {
    cacheSet("hello", { n: 1 });
    expect(cacheGet<{ n: number }>("hello")).toEqual({ n: 1 });
    expect(cacheStats().size).toBeGreaterThanOrEqual(1);
    expect(cacheStats().keys).toContain("hello");
  });

  it("invalidates by prefix", () => {
    cacheSet("analytics:a", 1);
    cacheSet("analytics:b", 2);
    cacheSet("other", 3);
    cacheInvalidate("analytics:");
    expect(cacheGet("analytics:a")).toBeUndefined();
    expect(cacheGet("analytics:b")).toBeUndefined();
    expect(cacheGet("other")).toBe(3);
  });

  it("getOrSet caches factory result", async () => {
    let calls = 0;
    const a = await cacheGetOrSet("factory-key", async () => {
      calls += 1;
      return "value";
    });
    const b = await cacheGetOrSet("factory-key", async () => {
      calls += 1;
      return "other";
    });
    expect(a).toBe("value");
    expect(b).toBe("value");
    expect(calls).toBe(1);
  });
});
