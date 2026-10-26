import * as z from "zod";
import {
  changeEmailConsentBodySchema,
  changePasswordBodySchema,
  changeUsernameBodySchema,
  createAccountBodySchema,
  createPostBodySchema,
  createPostUploadBodySchema,
  lookupSavedNamesBodySchema,
  postListQuerySchema,
  requestNewEmailVerificationLinkBodySchema,
  requestPasswordResetBodySchema,
  resetPasswordBodySchema,
  saveNameBodySchema,
  savedNameListQuerySchema,
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

export type ChangeEmailConsentRequestBody = z.infer<
  typeof changeEmailConsentBodySchema
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

export type CreatePostUploadRequestBody = z.infer<
  typeof createPostUploadBodySchema
>;

export type SaveNameRequestBody = z.infer<typeof saveNameBodySchema>;

export type SavedNameListQuery = z.infer<typeof savedNameListQuerySchema>;

export type LookupSavedNamesRequestBody = z.infer<
  typeof lookupSavedNamesBodySchema
>;
