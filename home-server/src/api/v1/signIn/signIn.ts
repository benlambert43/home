import { Router } from "express";
import { SignInResponse, signInBodySchema } from "@home/shared";
import { parseRequest } from "../http/parseRequest";
import { ApiMessage } from "../http/messages";
import { route } from "../http/router";
import { sendFailure, sendSuccess } from "../http/respond";
import { handleSignIn } from "./handlers/handleSignIn";
import { serializeUser } from "../types/serialize";

const signInRouter = Router();

signInRouter.post(
  "/",
  route(async (req, res) => {
    const body = parseRequest(signInBodySchema, req.body, res);
    if (!body) return;

    const signInResult = await handleSignIn(body);
    if (signInResult.error) return sendFailure(res, signInResult.message, 401);

    sendSuccess<SignInResponse>(res, {
      message: ApiMessage.SIGNED_IN,
      jwt: signInResult.token,
      user: serializeUser(signInResult.user),
    });
  }),
);

export default signInRouter;
