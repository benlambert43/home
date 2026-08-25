export const apiSessionSecret = () => {
  const secret = process.env.API_SESSION_SECRET;
  if (typeof secret !== "string" || secret.length < 1) {
    throw new Error("API_SESSION_SECRET is not defined.");
  }
  return secret;
};
