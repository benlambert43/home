import { Request, RequestHandler, Response } from "express";
import { ApiError } from "./apiError";
import { ApiMessage } from "./messages";
import { sendFailure } from "./respond";

export const route =
  <Params>(
    handler: (req: Request<Params>, res: Response) => unknown,
  ): RequestHandler<Params> =>
  async (req, res) => {
    try {
      await handler(req, res);
    } catch (e) {
      const where = `${req.method} ${req.originalUrl} failed`;

      if (e instanceof ApiError) {
        console.error(`${where}:`, e.detail ?? e.message);
        return sendFailure(res, e.message, e.status);
      }

      console.error(`${where}:`, e);
      sendFailure(res, ApiMessage.UNEXPECTED, 500);
    }
  };
