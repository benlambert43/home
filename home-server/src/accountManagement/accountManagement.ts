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

    const handleSendEmailVerificationRes = await handleSendEmailVerification(
      createAccount.user
    );

    if (handleSendEmailVerificationRes.error === true) {
      const createAccountEmailVerificationErrorResponse: CreateAccountResponse =
        {
          error: true,
          message:
            "Error creating account. Unable to send verification email to the provided address.",
        };
      await UserModel.findByIdAndDelete(createAccount.user._id);
      res.status(400).send(createAccountEmailVerificationErrorResponse);
      return;
    }

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

export default accountManagementRouter;
