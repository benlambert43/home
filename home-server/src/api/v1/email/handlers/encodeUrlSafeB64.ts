export const encodeUrlSafeB64 = (input: string) => {
  const base64Encoded = btoa(input);
  return base64Encoded
    .replace(/\+/g, "PLUS")
    .replace(/\//g, "SLASH")
    .replace(/=/g, "EQUALS");
};

export const decodeUrlSafeB64 = (encoded: string) => {
  const base64String = encoded
    .replace(/PLUS/g, "+")
    .replace(/SLASH/g, "/")
    .replace(/EQUALS/g, "=");
  try {
    return atob(base64String);
  } catch (e) {
    throw new Error("Invalid encoded value");
  }
};
