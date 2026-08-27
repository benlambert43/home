import { createHash, randomBytes } from "node:crypto";

const CODE_BYTES = 32;

export const generateEmailedCode = () =>
  randomBytes(CODE_BYTES).toString("hex");

export const hashEmailedCode = (code: string) =>
  createHash("sha256").update(code).digest("hex");
