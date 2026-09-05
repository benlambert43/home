import { ErrorRequestHandler } from "express";
import { ApiMessage } from "./messages";
import { sendFailure } from "./respond";

const statusOf = (error: unknown) =>
  error instanceof Error &&
  "status" in error &&
  typeof error.status === "number"
    ? error.status
    : 500;

const failureFor = (status: number) => {
  if (status === 413) {
    return { status, message: ApiMessage.REQUEST_TOO_LARGE };
  }

  if (status === 400) return { status, message: ApiMessage.INVALID_REQUEST };

  return { status: 500, message: ApiMessage.UNEXPECTED };
};

export const handleRequestError: ErrorRequestHandler = (
  error: unknown,
  req,
  res,
  next,
) => {
  if (res.headersSent) return next(error);

  const { status, message } = failureFor(statusOf(error));

  console.error(`${req.method} ${req.originalUrl} failed:`, error);

  sendFailure(res, message, status);
};
