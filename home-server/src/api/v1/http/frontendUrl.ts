export const frontendUrl = (path: string) => {
  const base = process.env.BASE_FRONTEND_URL;
  if (!base) {
    throw new Error(
      "Could not build a frontend URL, BASE_FRONTEND_URL is not defined.",
    );
  }
  return new URL(path, base.endsWith("/") ? base : `${base}/`);
};
