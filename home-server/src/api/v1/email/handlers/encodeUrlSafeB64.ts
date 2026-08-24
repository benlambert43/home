export const encodeUrlSafeB64 = (input: string) =>
  btoa(input)
    .replace(/\+/g, "PLUS")
    .replace(/\//g, "SLASH")
    .replace(/=/g, "EQUALS");

export const decodeUrlSafeB64 = (encoded: string) => {
  try {
    return atob(
      encoded
        .replace(/PLUS/g, "+")
        .replace(/SLASH/g, "/")
        .replace(/EQUALS/g, "="),
    );
  } catch {
    throw new Error("Invalid encoded value");
  }
};
