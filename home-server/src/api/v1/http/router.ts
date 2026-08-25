import { Request, RequestHandler, Response, Router } from "express";
import { sendFailure, sendSuccess } from "./respond";

export const route =
  <Params>(
    handler: (req: Request<Params>, res: Response) => unknown,
  ): RequestHandler<Params> =>
  async (req, res) => {
    try {
      await handler(req, res);
    } catch (e) {
      console.error(`${req.method} ${req.originalUrl} failed:`, e);
      sendFailure(res);
    }
  };

export const namedRouter = (name: string) => {
  const router = Router();
  router.get("/", (req, res) => sendSuccess(res, { message: `${name}.` }));
  return router;
};
