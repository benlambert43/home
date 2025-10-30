import { Router } from "express";
import { CreateAccountResponse } from "../types/response";
import * as z from "zod";
import {
  handleCreateAccount,
  removePasswordFromUserObject,
} from "./handlers/handleCreateAccount";

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
      username: z
        .string()
        .min(3, { message: "Username must be at least 3 characters long." }),
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
      username: req.body.username,
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

    const validcreateAccountRequestBody = createAccountRequestBody.data;

    console.log(validcreateAccountRequestBody);

    const createAccount = await handleCreateAccount(
      validcreateAccountRequestBody
    );

    const handleCreateAccountRes: CreateAccountResponse = {
      error: false,
      message: "New account created",
      jwt: createAccount.token,
      user: removePasswordFromUserObject(createAccount.user),
    };

    res.status(200).send(handleCreateAccountRes);
    return;
  } catch (e) {
    console.error(e);
    const handleCreateAccountRes: CreateAccountResponse = {
      error: true,
      message: "Error creating new account. Account was not created.",
    };
    res.status(400).send(handleCreateAccountRes);
    return;
  }
});

export default accountManagementRouter;
