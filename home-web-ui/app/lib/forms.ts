import * as z from "zod";
import {
  changePasswordFormSchema,
  changeUsernameBodySchema,
  createAccountFormSchema,
  createPostFormSchema,
  requestNewEmailVerificationLinkBodySchema,
  requestPasswordResetBodySchema,
  resetPasswordFormSchema,
  signInBodySchema,
} from "@home/shared";

type ErrorTree<Values> = {
  errors: string[];
  properties?: { [Field in keyof Values]?: { errors: string[] } };
};

export type FormState<Schema extends z.ZodType> =
  | (ErrorTree<z.output<Schema>> & {
      values?: Partial<Record<keyof z.output<Schema>, string>>;
    })
  | undefined;

export type SubmittedFormErrors = ErrorTree<Record<string, unknown>>;

export type CreateAccountFormState = FormState<typeof createAccountFormSchema>;

export type SignInFormState = FormState<typeof signInBodySchema>;

export type RequestNewEmailVerificationLinkFormState = FormState<
  typeof requestNewEmailVerificationLinkBodySchema
>;

export type ChangeUsernameFormState = FormState<
  typeof changeUsernameBodySchema
>;

export type ChangePasswordFormState = FormState<
  typeof changePasswordFormSchema
>;

export type RequestPasswordResetFormState = FormState<
  typeof requestPasswordResetBodySchema
>;

export type ResetPasswordFormState = FormState<typeof resetPasswordFormSchema>;

export type CreatePostFormState = FormState<typeof createPostFormSchema>;

export type DeleteAccountState = { errors: string[] };

export type FieldNames<Schema extends z.ZodType> = Record<
  keyof z.input<Schema>,
  string
>;

export const readFormValues = <Field extends string>(
  formData: FormData,
  fieldNames: Readonly<Record<Field, string>>,
): Record<Field, string> =>
  Object.fromEntries(
    Object.entries<string>(fieldNames).map(([field, inputName]) => {
      const value = formData.get(inputName);
      return [field, typeof value === "string" ? value : ""];
    }),
  ) as Record<Field, string>;

export const treeifyFormError = <T>(error: z.ZodError<T>) =>
  z.treeifyError(error, (issue) => `⚠️ ${issue.message}`);

export const hasFormErrors = (state: SubmittedFormErrors | undefined) =>
  Boolean(
    state &&
    (state.errors.length > 0 ||
      Object.values(state.properties ?? {}).some((field) =>
        Boolean(field?.errors.length),
      )),
  );
