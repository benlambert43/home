export const hasErrorCode = (error: unknown, code: string) =>
  error instanceof Error && "code" in error && error.code === code;

export const isMissing = (error: unknown) => hasErrorCode(error, "ENOENT");

export const isSystemError = (error: unknown) =>
  error instanceof Error && "syscall" in error;

export const unlessMissing = async <Value, Fallback>(
  attempt: () => Promise<Value>,
  fallback: Fallback,
): Promise<Value | Fallback> => {
  try {
    return await attempt();
  } catch (e) {
    if (isMissing(e)) return fallback;
    throw e;
  }
};
