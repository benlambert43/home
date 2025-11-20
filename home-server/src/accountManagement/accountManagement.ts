import { Router } from "express";
import { CreateAccountResponse } from "../types/response";
import * as z from "zod";
import {
  checkUniqueEmail,
  createNewUniqueRandomUsername,
  verifyCaptcha,
  handleCreateAccount,
  removePasswordFromUserObject,
} from "./handlers/handleCreateAccount";
import { handleSendEmailVerification } from "../email/handlers/handleSendEmailVerification";
import { UserModel } from "../model/userModel";
import { decodeUrlSafeB64 } from "../email/handlers/encodeUrlSafeB64";

const accountManagementRouter = Router();

accountManagementRouter.get("/", (req, res) => {
  res.status(200).send({ message: "Account Management Router" });
});

accountManagementRouter.post("/createAccount", async (req, res) => {
  try {
    const createAccountRequestBodySchema = z.object({
      firstname: z
        .string()
        .min(2, { message: "First name must be at least 2 characters long." }),
      lastname: z
        .string()
        .min(2, { message: "Last name must be at least 2 characters long." }),
      email: z.email({ message: "Please enter a valid email." }),
      password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long." }),
      grecaptcharesponse: z.string().min(1, {
        message:
          "Please complete the ReCAPTCHA challenge, or reload the page and try again.",
      }),
    });

    const createAccountRequestBody = createAccountRequestBodySchema.safeParse({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      password: req.body.password,
      grecaptcharesponse: req.body.grecaptcharesponse,
    });

    if (!createAccountRequestBody.success) {
      const errors = z.treeifyError(createAccountRequestBody.error);

      const createAccountReqBodyErrorResponse: CreateAccountResponse = {
        error: true,
        message: "Error creating account while parsing request body.",
      };

      res.status(400).send(createAccountReqBodyErrorResponse);
      return;
    }

    const validCaptcha = await verifyCaptcha(
      createAccountRequestBody.data.grecaptcharesponse
    );

    if (!validCaptcha.success) {
      const createAccountRecaptchaErrorResponse: CreateAccountResponse = {
        error: true,
        message: "Error creating account. Recaptcha challenge failed.",
      };

      res.status(400).send(createAccountRecaptchaErrorResponse);
      return;
    }

    const uniqueRandomUsername = await createNewUniqueRandomUsername();

    if (!uniqueRandomUsername) {
      const createAccountUsernameErrorResponse: CreateAccountResponse = {
        error: true,
        message: "Error creating account with randomized username.",
      };

      res.status(400).send(createAccountUsernameErrorResponse);
      return;
    }

    const uniqueEmail = await checkUniqueEmail(
      createAccountRequestBody.data.email
    );

    if (!uniqueEmail) {
      const createAccountEmailErrorResponse: CreateAccountResponse = {
        error: true,
        message:
          "Error creating account. An account with this email already exists.",
      };

      res.status(400).send(createAccountEmailErrorResponse);
      return;
    }

    const validCreateAccountRequestBody = {
      ...createAccountRequestBody.data,
      username: uniqueRandomUsername,
    };

    const createAccount = await handleCreateAccount(
      validCreateAccountRequestBody
    );

    handleSendEmailVerification(createAccount.user);

    const handleCreateAccountRes: CreateAccountResponse = {
      error: false,
      message: "New account created",
      jwt: createAccount.token,
      user: removePasswordFromUserObject(createAccount.user),
    };

    res.status(200).send(handleCreateAccountRes);
    return;
  } catch (e) {
    const handleCreateAccountRes: CreateAccountResponse = {
      error: true,
      message: "Error creating new account. Account was not created.",
    };
    res.status(400).send(handleCreateAccountRes);
    return;
  }
});

accountManagementRouter.get(
  "/verifyEmail/:username/:email/:code",
  async (req, res) => {
    try {
      const verifyEmailUrlParamSchema = z.object({
        username: z
          .string()
          .min(1)
          .regex(/^[a-zA-Z0-9-]+$/),
        email: z.email(),
        code: z
          .string()
          .min(1)
          .regex(/^[a-zA-Z0-9-]+$/),
      });

      const verifyEmailUrlParams = verifyEmailUrlParamSchema.safeParse({
        username: decodeUrlSafeB64(req.params.username),
        email: decodeUrlSafeB64(req.params.email),
        code: req.params.code,
      });

      if (!verifyEmailUrlParams.success) {
        const errors = z.treeifyError(verifyEmailUrlParams.error);
        res.status(400).send({ error: true });
        return;
      }

      res.send({
        username: verifyEmailUrlParams.data.username,
        email: verifyEmailUrlParams.data.email,
        code: verifyEmailUrlParams.data.code,
      });
      return;
    } catch (e) {
      res.status(400).send({ error: true });
      return;
    }
  }
);

export default accountManagementRouter;
