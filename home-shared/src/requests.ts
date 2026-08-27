import * as z from "zod";
import {
  changePasswordBodySchema,
  changeUsernameBodySchema,
  createAccountBodySchema,
  requestNewEmailVerificationLinkBodySchema,
  requestPasswordResetBodySchema,
  resetPasswordBodySchema,
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

export type ChangePasswordRequestBody = z.infer<
  typeof changePasswordBodySchema
>;

export type RequestPasswordResetRequestBody = z.infer<
  typeof requestPasswordResetBodySchema
>;

export type ResetPasswordRequestBody = z.infer<typeof resetPasswordBodySchema>;
