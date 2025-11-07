import { Router } from "express";
import { SignInResponse } from "../types/response";
import * as z from "zod";
import { handleSignIn } from "./handlers/handleSignIn";
import { removePasswordFromUserObject } from "../accountManagement/handlers/handleCreateAccount";

const signInRouter = Router();

signInRouter.get("/", (req, res) => {
  res.status(200).send({ message: "Sign In Router" });
});

signInRouter.post("/", async (req, res) => {
  try {
    const signInRequestBodySchema = z.object({
      email: z.email({ message: "Please enter a valid email." }),
      password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long." }),
    });

    const signInRequestBody = signInRequestBodySchema.safeParse({
      email: req.body.email,
      password: req.body.password,
    });

    if (!signInRequestBody.success) {
      const errors = z.treeifyError(signInRequestBody.error);

      const signInReqBodyErrorResponse: SignInResponse = {
        error: true,
        message: "Error signing in while parsing request body.",
      };

      res.status(400).send(signInReqBodyErrorResponse);
      return;
    }

    const signIn = await handleSignIn({
      email: signInRequestBody.data?.email,
      password: signInRequestBody.data?.password,
    });

    if (!signIn.user) {
      const signInNoUserFoundWithEmail: SignInResponse = {
        error: true,
        message: "Error signing in. No user with this email address was found.",
      };

      res.status(400).send(signInNoUserFoundWithEmail);
      return;
    }

    const handleSignInRes: SignInResponse = {
      error: false,
      message: "Sign in successful.",
      jwt: signIn.token,
      user: removePasswordFromUserObject(signIn.user),
    };

    res.status(200).send(handleSignInRes);
    return;
  } catch (e) {
    console.error(e);
    const handleSignInRes: SignInResponse = {
      error: true,
      message: "Error signing in. Please try again.",
    };
    res.status(400).send(handleSignInRes);
    return;
  }
});

export default signInRouter;
