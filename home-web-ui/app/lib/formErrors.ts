import * as z from "zod";

export const treeifyFormError = <T>(error: z.ZodError<T>) =>
  z.treeifyError(error, (issue) => `⚠️ ${issue.message}`);
