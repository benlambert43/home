import * as z from "zod";
import {
  changeUsernameBodySchema,
  createAccountFormSchema,
  requestNewEmailVerificationLinkBodySchema,
  signInBodySchema,
} from "@home/shared";

type FieldErrors<Values> = {
  [Field in keyof Values]?: { errors: string[] };
};

export type FormState<Schema extends z.ZodType> =
  | {
      errors: string[];
      values?: Partial<Record<keyof z.output<Schema>, string>>;
      properties?: FieldErrors<z.output<Schema>>;
      success?: boolean;
    }
  | undefined;

export type CreateAccountFormState = FormState<typeof createAccountFormSchema>;

export type SignInFormState = FormState<typeof signInBodySchema>;

export type RequestNewEmailVerificationLinkFormState = FormState<
  typeof requestNewEmailVerificationLinkBodySchema
>;

export type ChangeUsernameFormState = FormState<
  typeof changeUsernameBodySchema
>;
