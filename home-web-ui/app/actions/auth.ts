"use server";

import { SignupFormSchema, SignupFormState } from "@/app/lib/definitions";
import * as z from "zod";

export const createAccount = async (
  state: SignupFormState,
  formData: FormData,
) => {
  const validatedFields = SignupFormSchema.safeParse({
    firstname: formData.get("firstname"),
    lastname: formData.get("lastname"),
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return z.treeifyError(validatedFields.error);
  }

  console.log("Success!");
};
