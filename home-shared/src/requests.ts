import * as z from "zod";
import {
  changePasswordBodySchema,
  changeUsernameBodySchema,
  createAccountBodySchema,
  createPostBodySchema,
  postListQuerySchema,
  requestNewEmailVerificationLinkBodySchema,
  requestPasswordResetBodySchema,
  resetPasswordBodySchema,
  signInBodySchema,
  updatePostBodySchema,
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

export type CreatePostRequestBody = z.infer<typeof createPostBodySchema>;

export type UpdatePostRequestBody = z.infer<typeof updatePostBodySchema>;

export type PostListQuery = z.infer<typeof postListQuerySchema>;

export type PostInlineImageRequest =
  CreatePostRequestBody["inlineImages"][number];
