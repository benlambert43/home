import { createHash } from "node:crypto";

const FINGERPRINT_CHARACTERS = 32;

export const fingerprint = (...parts: string[]) =>
  createHash("sha256")
    .update(parts.join(":"))
    .digest("hex")
    .slice(0, FINGERPRINT_CHARACTERS);
