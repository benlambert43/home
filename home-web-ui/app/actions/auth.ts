"use server";

import { createSession } from "@/app/actions/session";
import { getApiSessionToken } from "@/app/auth/getApiSessionToken";
import { apiFetch, apiRequest, errorMessage } from "@/app/lib/api";
import {
  CreateAccountFormState,
  FieldNames,
  readFormValues,
  RequestNewEmailVerificationLinkFormState,
  RequestPasswordResetFormState,
  ResetPasswordFormState,
  SignInFormState,
  treeifyFormError,
} from "@/app/lib/forms";
import { BASE_API_URL } from "@/app/lib/serverEnv";
import {
  CheckPasswordResetLinkResponse,
  createAccountFormSchema,
  CreateAccountRequestBody,
  CreateAccountResponse,
  requestNewEmailVerificationLinkBodySchema,
  RequestNewEmailVerificationLinkResponse,
  RequestNewEmailVerificationLinkRequestBody,
  requestPasswordResetBodySchema,
  RequestPasswordResetRequestBody,
  RequestPasswordResetResponse,
  resetPasswordFormSchema,
  ResetPasswordRequestBody,
  ResetPasswordResponse,
  signInBodySchema,
  SignInRequestBody,
  SignInResponse,
  VerifyEmailResponse,
} from "@home/shared";
import { redirect } from "next/navigation";

const CREATE_ACCOUNT_URL = `${BASE_API_URL}/accountManagement/createAccount`;
const SIGN_IN_URL = `${BASE_API_URL}/signIn`;
const REQUEST_NEW_EMAIL_VERIFICATION_LINK_URL = `${BASE_API_URL}/accountManagement/requestNewEmailVerificationLink`;
const VERIFY_EMAIL_URL = `${BASE_API_URL}/accountManagement/verifyEmail`;
const REQUEST_PASSWORD_RESET_URL = `${BASE_API_URL}/accountManagement/requestPasswordReset`;
const PASSWORD_RESET_LINK_URL = `${BASE_API_URL}/accountManagement/passwordResetLink`;
const RESET_PASSWORD_URL = `${BASE_API_URL}/accountManagement/resetPassword`;

const CREATE_ACCOUNT_FIELDS = {
  firstname: "firstname",
  lastname: "lastname",
  email: "email",
  password: "password",
  confirmPassword: "confirmPassword",
  grecaptcharesponse: "g-recaptcha-response",
} as const satisfies FieldNames<typeof createAccountFormSchema>;

const SIGN_IN_FIELDS = {
  email: "email",
  password: "password",
} as const satisfies FieldNames<typeof signInBodySchema>;

const REQUEST_NEW_EMAIL_VERIFICATION_FIELDS = {
  grecaptcharesponse: "g-recaptcha-response",
} as const satisfies FieldNames<
  typeof requestNewEmailVerificationLinkBodySchema
>;

const REQUEST_PASSWORD_RESET_FIELDS = {
  email: "email",
  grecaptcharesponse: "g-recaptcha-response",
} as const satisfies FieldNames<typeof requestPasswordResetBodySchema>;

const RESET_PASSWORD_FIELDS = {
  code: "code",
  newPassword: "newPassword",
  confirmNewPassword: "confirmNewPassword",
} as const satisfies FieldNames<typeof resetPasswordFormSchema>;

export const createAccount = async (
  state: CreateAccountFormState,
  formData: FormData,
): Promise<CreateAccountFormState> => {
  const values = readFormValues(formData, CREATE_ACCOUNT_FIELDS);
  const validatedFields = createAccountFormSchema.safeParse(values);

  if (!validatedFields.success) {
    return { values, ...treeifyFormError(validatedFields.error) };
  }

  const { confirmPassword, ...createAccountBody } = validatedFields.data;

  try {
    const { jwt, user } = await apiFetch<
      CreateAccountResponse,
      CreateAccountRequestBody
    >(CREATE_ACCOUNT_URL, { method: "POST", body: createAccountBody });

    await createSession(jwt, user);
  } catch (error) {
    return { values, errors: [errorMessage(error)] };
  }

  redirect("/profile");
};

export const signIn = async (
  state: SignInFormState,
  formData: FormData,
): Promise<SignInFormState> => {
  const values = readFormValues(formData, SIGN_IN_FIELDS);
  const validatedFields = signInBodySchema.safeParse(values);

  if (!validatedFields.success) {
    return { values, ...treeifyFormError(validatedFields.error) };
  }

  try {
    const { jwt, user } = await apiFetch<SignInResponse, SignInRequestBody>(
      SIGN_IN_URL,
      { method: "POST", body: validatedFields.data },
    );

    await createSession(jwt, user);
  } catch (error) {
    return { values, errors: [errorMessage(error)] };
  }

  redirect("/profile");
};

export const requestNewEmailVerificationLink = async (
  state: RequestNewEmailVerificationLinkFormState,
  formData: FormData,
): Promise<RequestNewEmailVerificationLinkFormState> => {
  const values = readFormValues(
    formData,
    REQUEST_NEW_EMAIL_VERIFICATION_FIELDS,
  );
  const validatedFields =
    requestNewEmailVerificationLinkBodySchema.safeParse(values);

  if (!validatedFields.success) {
    return treeifyFormError(validatedFields.error);
  }

  try {
    await apiFetch<
      RequestNewEmailVerificationLinkResponse,
      RequestNewEmailVerificationLinkRequestBody
    >(REQUEST_NEW_EMAIL_VERIFICATION_LINK_URL, {
      method: "POST",
      authorization: await getApiSessionToken(),
      body: validatedFields.data,
    });
  } catch (error) {
    return { errors: [errorMessage(error)] };
  }

  redirect("/profile/accountManagement/requestNewEmailVerificationLinkSuccess");
};

export const verifyEmail = async (
  username: string,
  email: string,
  code: string,
): Promise<VerifyEmailResponse> => {
  const path = [username, email, code].map(encodeURIComponent).join("/");

  return apiRequest<VerifyEmailResponse>(`${VERIFY_EMAIL_URL}/${path}`, {
    cache: "no-store",
  });
};

export const requestPasswordReset = async (
  state: RequestPasswordResetFormState,
  formData: FormData,
): Promise<RequestPasswordResetFormState> => {
  const values = readFormValues(formData, REQUEST_PASSWORD_RESET_FIELDS);
  const validatedFields = requestPasswordResetBodySchema.safeParse(values);

  if (!validatedFields.success) {
    return { values, ...treeifyFormError(validatedFields.error) };
  }

  try {
    await apiFetch<
      RequestPasswordResetResponse,
      RequestPasswordResetRequestBody
    >(REQUEST_PASSWORD_RESET_URL, {
      method: "POST",
      body: validatedFields.data,
    });
  } catch (error) {
    return { values, errors: [errorMessage(error)] };
  }

  redirect("/forgotpasswordsuccess");
};

export const checkPasswordResetLink = async (
  code: string,
): Promise<CheckPasswordResetLinkResponse> =>
  apiRequest<CheckPasswordResetLinkResponse>(
    `${PASSWORD_RESET_LINK_URL}/${encodeURIComponent(code)}`,
    { cache: "no-store" },
  );

export const resetPassword = async (
  state: ResetPasswordFormState,
  formData: FormData,
): Promise<ResetPasswordFormState> => {
  const values = readFormValues(formData, RESET_PASSWORD_FIELDS);
  const validatedFields = resetPasswordFormSchema.safeParse(values);

  if (!validatedFields.success) {
    return treeifyFormError(validatedFields.error);
  }

  const { confirmNewPassword, ...resetPasswordBody } = validatedFields.data;

  try {
    await apiFetch<ResetPasswordResponse, ResetPasswordRequestBody>(
      RESET_PASSWORD_URL,
      { method: "POST", body: resetPasswordBody },
    );
  } catch (error) {
    return { errors: [errorMessage(error)] };
  }

  redirect("/profile/accountManagement/resetPasswordSuccess");
};
