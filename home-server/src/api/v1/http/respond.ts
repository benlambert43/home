import { Response } from "express";
import { ApiResponse } from "@home/shared";
import { ApiMessage } from "./messages";

export const sendSuccess = <T extends ApiResponse>(
  res: Response,
  body: Omit<T, "error">,
  status = 200,
) => {
  res.status(status).send({ ...body, error: false });
};

export const sendFailure = (
  res: Response,
  message: string = ApiMessage.UNEXPECTED,
  status = 400,
) => {
  const body: ApiResponse = { error: true, message };
  res.status(status).send(body);
};

export const sendUnauthenticated = (res: Response) =>
  sendFailure(res, ApiMessage.UNAUTHENTICATED, 401);

export const sendResult = (res: Response, result: ApiResponse) => {
  res.status(result.error ? 400 : 200).send(result);
};
