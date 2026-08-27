import { createHash, randomBytes } from "node:crypto";

const CODE_BYTES = 32;

export const generatePasswordResetCode = () =>
  randomBytes(CODE_BYTES).toString("hex");

export const hashPasswordResetCode = (code: string) =>
  createHash("sha256").update(code).digest("hex");
