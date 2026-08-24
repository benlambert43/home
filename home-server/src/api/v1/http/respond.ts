import { Response } from "express";
import { ApiFailure, ApiResponse, SuccessOf } from "@home/shared";
import { ApiMessage } from "./messages";

export const sendSuccess = <Result extends ApiResponse>(
  res: Response,
  body: Omit<SuccessOf<Result>, "error">,
  status = 200,
) => {
  res.status(status).send({ ...body, error: false });
};

export const sendFailure = (
  res: Response,
  message: string = ApiMessage.UNEXPECTED,
  status = 400,
) => {
  const body: ApiFailure = { error: true, message };
  res.status(status).send(body);
};

export const sendUnauthenticated = (res: Response) =>
  sendFailure(res, ApiMessage.UNAUTHENTICATED, 401);

export const sendResult = (res: Response, result: ApiResponse) => {
  res.status(result.error ? 400 : 200).send(result);
};
