export const encodeUrlSafeB64 = (input: string) =>
  Buffer.from(input).toString("base64url");

export const decodeUrlSafeB64 = (encoded: string) => {
  const decoded = Buffer.from(encoded, "base64url").toString();

  return Buffer.from(decoded).toString("base64url") === encoded
    ? decoded
    : undefined;
};
