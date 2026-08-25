import { Notification } from "./notification";
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

export type GetNotificationsResponse = ApiResponse<{
  notifications: Notification[];
}>;
