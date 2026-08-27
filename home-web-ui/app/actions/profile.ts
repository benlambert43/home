"use server";

import { createSession, removeSession } from "@/app/actions/session";
import { getApiSessionToken } from "@/app/auth/getApiSessionToken";
import { apiFetch, errorMessage } from "@/app/lib/api";
import {
  ChangeUsernameFormState,
  DeleteAccountState,
  FieldNames,
  readFormValues,
  treeifyFormError,
} from "@/app/lib/forms";
import {
  changeUsernameBodySchema,
  ChangeUsernameRequestBody,
  ChangeUsernameResponse,
  DeleteAccountResponse,
} from "@home/shared";
import { redirect } from "next/navigation";

const CHANGE_USERNAME_URL = `${process.env.BASE_API_URL}/accountManagement/changeUsername`;
const DELETE_ACCOUNT_URL = `${process.env.BASE_API_URL}/accountManagement/deleteAccount`;

const CHANGE_USERNAME_FIELDS = {
  newUsername: "newUsername",
} as const satisfies FieldNames<typeof changeUsernameBodySchema>;

export const changeUsername = async (
  state: ChangeUsernameFormState,
  formData: FormData,
): Promise<ChangeUsernameFormState> => {
  const values = readFormValues(formData, CHANGE_USERNAME_FIELDS);
  const validatedFields = changeUsernameBodySchema.safeParse(values);

  if (!validatedFields.success) {
    return { values, ...treeifyFormError(validatedFields.error) };
  }

  try {
    const { jwt, user } = await apiFetch<
      ChangeUsernameResponse,
      ChangeUsernameRequestBody
    >(CHANGE_USERNAME_URL, {
      method: "POST",
      authorization: await getApiSessionToken(),
      body: validatedFields.data,
    });

    await createSession(jwt, user);
  } catch (error) {
    return { values, errors: [errorMessage(error)] };
  }

  redirect("/settings");
};

export const deleteAccount = async (): Promise<
  DeleteAccountState | undefined
> => {
  try {
    await apiFetch<DeleteAccountResponse>(DELETE_ACCOUNT_URL, {
      method: "POST",
      authorization: await getApiSessionToken(),
    });
  } catch (error) {
    return { errors: [errorMessage(error)] };
  }

  await removeSession();
};
