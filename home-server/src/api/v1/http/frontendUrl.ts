export const frontendUrl = (path: string) => {
  const base = process.env.BASE_FRONTEND_URL ?? "";
  return new URL(path, base.endsWith("/") ? base : `${base}/`);
};
