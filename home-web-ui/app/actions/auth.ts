"use server";

import { createSession } from "@/app/actions/session";
import {
  SignInFormSchema,
  SignInFormState,
  SignUpFormSchema,
  SignUpFormState,
} from "@/app/lib/definitions";
import { CreateAccountRequestBody } from "@/app/types/request";
import { CreateAccountResponse } from "@/app/types/response";
import * as z from "zod";
import { redirect } from "next/navigation";

const CREATE_ACCOUNT_URL = `${process.env.API_URL}/accountManagement/createAccount`;

export const createAccount = async (
  state: SignUpFormState,
  formData: FormData,
) => {
  const validatedFields = SignUpFormSchema.safeParse({
    firstname: formData.get("firstname"),
    lastname: formData.get("lastname"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    grecaptcharesponse: formData.get("g-recaptcha-response"),
  });

  if (!validatedFields.success) {
    const errors = z.treeifyError(validatedFields.error);
    return errors;
  }

  const createAccountRequestBody: CreateAccountRequestBody =
    validatedFields.data;

  try {
    const response = await fetch(CREATE_ACCOUNT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createAccountRequestBody),
    });
    if (!response.ok) {
      const maybeResponse = await response.json();
      const maybeResponseMessage = maybeResponse?.message;
      throw new Error(
        maybeResponseMessage
          ? maybeResponseMessage
          : `response.status ${response.status}`,
      );
    }

    const json = await response.json();

    const createAccountResponse: CreateAccountResponse = {
      error: json.error,
      jwt: json.jwt,
      message: json.message,
      user: json.user,
    };

    if (
      createAccountResponse.error === false &&
      createAccountResponse.jwt &&
      createAccountResponse.user
    ) {
      await createSession(
        createAccountResponse.jwt,
        createAccountResponse.user,
      );
    } else {
      throw new Error("createAccountResponse error.");
    }
  } catch (error: any) {
    const errorString =
      "message" in error ? `${error.message.toString()}` : "Unknown error.";
    console.error(errorString);
    return { errors: [errorString] };
  }
  redirect("/profile");
};

export const signIn = async (state: SignInFormState, formData: FormData) => {
  return {} as SignInFormState;
};
