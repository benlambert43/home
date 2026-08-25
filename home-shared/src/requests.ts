import * as z from "zod";
import {
  changeUsernameBodySchema,
  createAccountBodySchema,
  requestNewEmailVerificationLinkBodySchema,
  signInBodySchema,
} from "./schemas";

export type CreateAccountRequestBody = z.infer<typeof createAccountBodySchema>;

export type SignInRequestBody = z.infer<typeof signInBodySchema>;

export type RequestNewEmailVerificationLinkRequestBody = z.infer<
  typeof requestNewEmailVerificationLinkBodySchema
>;

export type ChangeUsernameRequestBody = z.infer<
  typeof changeUsernameBodySchema
>;
