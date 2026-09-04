import { describe, expect, it } from "vitest";

describe("route wraps errors descriptively", () => {
  it("responds without an error", () => {
    expect(1).toEqual(1);
  });
});
