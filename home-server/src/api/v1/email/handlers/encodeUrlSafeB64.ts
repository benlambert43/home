export const encodeUrlSafeB64 = (input: string) =>
  Buffer.from(input).toString("base64url");

export const decodeUrlSafeB64 = (encoded: string) => {
  const decoded = Buffer.from(encoded, "base64url").toString();

  if (Buffer.from(decoded).toString("base64url") !== encoded) {
    throw new Error("Invalid encoded value");
  }

  return decoded;
};
