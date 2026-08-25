import { describe, expect, it } from "vitest";

import { signInBodySchema } from "./schemas";

describe("signInBodySchema", () => {
  it("parses a well-formed sign-in body without errors", () => {
    const result = signInBodySchema.safeParse({
      email: "someone@example.com",
      password: "correcthorsebattery",
    });

    expect(result.success).toBe(true);
  });
});
