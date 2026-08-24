"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ChangeUsernameFormState } from "@/app/lib/definitions";
import { treeifyFormError } from "@/app/lib/formErrors";
import {
  changeUsernameBodySchema,
  ChangeUsernameRequestBody,
  ChangeUsernameResponse,
} from "@home/shared";
import { updateSessionTokens } from "@/app/actions/session";
import { isRedirectError } from "next/dist/client/components/redirect-error";

const CHANGE_USERNAME_LINK_URL = `${process.env.BASE_API_URL}/accountManagement/changeUsername`;

export const changeUsername = async (
  state: ChangeUsernameFormState,
  formData: FormData,
) => {
  const cookieStore = await cookies();
  const apiSessionCookie = cookieStore.get("apisession");

  const unvalidatedInputs = {
    unvalidatedNewUsername: formData.get("newUsername")
      ? formData.get("newUsername")?.toString()
      : undefined,
  };

  const changeUsernameReturn: ChangeUsernameFormState = {
    errors: [],
    values: { newUsername: unvalidatedInputs.unvalidatedNewUsername },
    properties: {},
  };

  const validatedFields = changeUsernameBodySchema.safeParse({
    newUsername: formData.get("newUsername"),
  });

  if (!validatedFields.success) {
    const errors = treeifyFormError(validatedFields.error);
    return { ...changeUsernameReturn, ...errors };
  }

  const changeUsernameRequestBody: ChangeUsernameRequestBody =
    validatedFields.data;

  try {
    const response = await fetch(CHANGE_USERNAME_LINK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiSessionCookie?.value || "",
      },
      body: JSON.stringify(changeUsernameRequestBody),
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

    const changeUsernameResponse: ChangeUsernameResponse = {
      error: json.error,
      jwt: json.jwt,
      message: json.message,
      user: json.user,
    };

    if (
      changeUsernameResponse.error === false &&
      changeUsernameResponse.jwt &&
      changeUsernameResponse.user
    ) {
      await updateSessionTokens({
        encodedApiJwtSession: changeUsernameResponse.jwt,
        user: changeUsernameResponse.user,
      });
      redirect("/profile");
    } else {
      throw new Error("changeUsernameResponse error.");
    }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    const errorString =
      error instanceof Error ? error.message : "Unknown error.";

    return { ...changeUsernameReturn, errors: [errorString] };
  }
};
