import { describe, expect, it } from "vitest";

import { tooManySignInAttempts } from "./messages";

describe("tooManySignInAttempts", () => {
  it("pluralises the wait", () => {
    expect(tooManySignInAttempts(1)).toContain("wait 1 minute and");
    expect(tooManySignInAttempts(5)).toContain("wait 5 minutes and");
  });
});
