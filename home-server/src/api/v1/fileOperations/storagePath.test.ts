import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveStoragePath } from "./storagePath";

const STORAGE_ROOT = path.resolve("storage");

describe("resolveStoragePath", () => {
  it("resolves a path inside the storage directory", () => {
    expect(resolveStoragePath("blog-posts/a/content-markdown.md")).toBe(
      path.join(STORAGE_ROOT, "blog-posts", "a", "content-markdown.md"),
    );
  });

  it("resolves the storage directory itself", () => {
    expect(resolveStoragePath("")).toBe(STORAGE_ROOT);
  });

  it("refuses a path that escapes the storage directory", () => {
    expect(() => resolveStoragePath("../secrets")).toThrow(
      "Refusing to use a path outside of storage: ../secrets",
    );
  });
});
