import { Response } from "express";
import * as z from "zod";
import { ApiMessage } from "./messages";
import { sendFailure } from "./respond";

export const parseRequest = <Schema extends z.ZodType>(
  schema: Schema,
  input: unknown,
  res: Response,
): z.infer<Schema> | undefined => {
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    sendFailure(res, ApiMessage.INVALID_REQUEST);
    return undefined;
  }

  return parsed.data;
};
