import { Notification } from "./notification";
import { Post, PostPagination, PostSummary } from "./post";
import { UserNoPassword } from "./user";

export interface ApiFailure {
  error: true;
  message: string;
}

export type ApiSuccess<Payload = unknown> = {
  error: false;
  message?: string;
} & Payload;

export type ApiResponse<Payload = unknown> = ApiSuccess<Payload> | ApiFailure;

export type SuccessOf<Result> = Extract<Result, { error: false }>;

export interface SessionPayload {
  jwt: string;
  user: UserNoPassword;
}

export type SessionResponse = ApiResponse<SessionPayload>;

export type CreateAccountResponse = SessionResponse;

export type SignInResponse = SessionResponse;

export type ChangeUsernameResponse = SessionResponse;

export type VerifyEmailResponse = SessionResponse;

export type RequestNewEmailVerificationLinkResponse = ApiResponse;

export type ChangePasswordResponse = SessionResponse;

export type RequestPasswordResetResponse = ApiResponse;

export type CheckPasswordResetLinkResponse = ApiResponse;

export type ResetPasswordResponse = ApiResponse;

export type DeleteAccountResponse = ApiResponse;

export type GetNotificationsResponse = ApiResponse<{
  notifications: Notification[];
}>;

export type CreatePostResponse = ApiResponse<{ post: Post }>;

export type GetPostsResponse = ApiResponse<{
  posts: PostSummary[];
  pagination: PostPagination;
}>;

export type GetPostResponse = ApiResponse<{ post: Post }>;

export type UpdatePostResponse = ApiResponse<{ post: Post }>;

export type DeletePostResponse = ApiResponse;
