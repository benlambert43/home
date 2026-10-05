"use server";

import { getApiSessionToken } from "@/app/auth/getApiSessionToken";
import { getBffSessionUser } from "@/app/auth/getBffSessionUser";
import { clearSession, createSession } from "@/app/auth/sessionCookies";
import { apiFetch, errorMessage } from "@/app/lib/api";
import {
  ChangeEmailConsentState,
  ChangePasswordFormState,
  ChangeUsernameFormState,
  DeleteAccountState,
  FieldNames,
  readFormValues,
  treeifyFormError,
} from "@/app/lib/forms";
import { INVALID_REQUEST_MESSAGE } from "@/app/lib/messages";
import { postAuthorTag } from "@/app/lib/posts";
import { BASE_API_URL } from "@/app/lib/serverEnv";
import {
  changeEmailConsentBodySchema,
  ChangeEmailConsentRequestBody,
  ChangeEmailConsentResponse,
  changePasswordFormSchema,
  ChangePasswordRequestBody,
  ChangePasswordResponse,
  changeUsernameBodySchema,
  ChangeUsernameRequestBody,
  ChangeUsernameResponse,
  DeleteAccountResponse,
} from "@home/shared";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

const CHANGE_USERNAME_URL = `${BASE_API_URL}/accountManagement/changeUsername`;
const CHANGE_EMAIL_CONSENT_URL = `${BASE_API_URL}/accountManagement/changeEmailConsent`;
const CHANGE_PASSWORD_URL = `${BASE_API_URL}/accountManagement/changePassword`;
const DELETE_ACCOUNT_URL = `${BASE_API_URL}/accountManagement/deleteAccount`;

const CHANGE_USERNAME_FIELDS = {
  newUsername: "newUsername",
} as const satisfies FieldNames<typeof changeUsernameBodySchema>;

const CHANGE_PASSWORD_FIELDS = {
  currentPassword: "currentPassword",
  newPassword: "newPassword",
  confirmNewPassword: "confirmNewPassword",
} as const satisfies FieldNames<typeof changePasswordFormSchema>;

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
    updateTag(postAuthorTag(user._id));
  } catch (error) {
    return { values, errors: [errorMessage(error)] };
  }

  redirect("/settings");
};

export const changeEmailConsent = async (
  consent: ChangeEmailConsentRequestBody,
): Promise<ChangeEmailConsentState | undefined> => {
  const validatedConsent = changeEmailConsentBodySchema.safeParse(consent);

  if (!validatedConsent.success) {
    return { errors: [INVALID_REQUEST_MESSAGE] };
  }

  try {
    const { jwt, user } = await apiFetch<
      ChangeEmailConsentResponse,
      ChangeEmailConsentRequestBody
    >(CHANGE_EMAIL_CONSENT_URL, {
      method: "POST",
      authorization: await getApiSessionToken(),
      body: validatedConsent.data,
    });

    await createSession(jwt, user);
  } catch (error) {
    return { errors: [errorMessage(error)] };
  }

  return undefined;
};

export const changePassword = async (
  state: ChangePasswordFormState,
  formData: FormData,
): Promise<ChangePasswordFormState> => {
  const values = readFormValues(formData, CHANGE_PASSWORD_FIELDS);
  const validatedFields = changePasswordFormSchema.safeParse(values);

  if (!validatedFields.success) {
    return treeifyFormError(validatedFields.error);
  }

  const { confirmNewPassword, ...changePasswordBody } = validatedFields.data;

  try {
    const { jwt, user } = await apiFetch<
      ChangePasswordResponse,
      ChangePasswordRequestBody
    >(CHANGE_PASSWORD_URL, {
      method: "POST",
      authorization: await getApiSessionToken(),
      body: changePasswordBody,
    });

    await createSession(jwt, user);
  } catch (error) {
    return { errors: [errorMessage(error)] };
  }

  redirect("/settings");
};

export const deleteAccount = async (): Promise<
  DeleteAccountState | undefined
> => {
  const user = await getBffSessionUser();

  try {
    await apiFetch<DeleteAccountResponse>(DELETE_ACCOUNT_URL, {
      method: "POST",
      authorization: await getApiSessionToken(),
    });
  } catch (error) {
    return { errors: [errorMessage(error)] };
  }

  if (user) updateTag(postAuthorTag(user._id));
  await clearSession();
  redirect("/signin");
};
