"use server";

import { updateSessionTokens } from "@/app/actions/session";
import { getApiSessionToken } from "@/app/auth/getApiSessionToken";
import { apiFetch, errorMessage, requireSession } from "@/app/lib/api";
import { ChangeUsernameFormState } from "@/app/lib/definitions";
import { FieldNames, readFormValues, treeifyFormError } from "@/app/lib/forms";
import {
  changeUsernameBodySchema,
  ChangeUsernameRequestBody,
  ChangeUsernameResponse,
} from "@home/shared";
import { redirect } from "next/navigation";

const CHANGE_USERNAME_LINK_URL = `${process.env.BASE_API_URL}/accountManagement/changeUsername`;

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
    const { jwt, user } = requireSession(
      await apiFetch<ChangeUsernameResponse, ChangeUsernameRequestBody>(
        CHANGE_USERNAME_LINK_URL,
        {
          method: "POST",
          authorization: await getApiSessionToken(),
          body: validatedFields.data,
        },
      ),
    );
    await updateSessionTokens({ encodedApiJwtSession: jwt, user });
  } catch (error) {
    return { values, errors: [errorMessage(error)] };
  }

  redirect("/profile");
};
