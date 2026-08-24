import { Notification } from "./notification";
import { UserNoPassword } from "./user";

export interface ApiFailure {
  error: true;
  message: string;
}

export type ApiSuccess<Payload = unknown> = {
  error: false;
  message: string;
} & Payload;

export type ApiResponse<Payload = unknown> = ApiSuccess<Payload> | ApiFailure;

export type SuccessOf<Result> = Extract<Result, { error: false }>;

export interface SessionPayload {
  jwt: string;
  user: UserNoPassword;
}

export type CreateAccountResponse = ApiResponse<SessionPayload>;

export type SignInResponse = ApiResponse<SessionPayload>;

export type ChangeUsernameResponse = ApiResponse<SessionPayload>;

export type VerifyEmailResponse = ApiResponse<SessionPayload>;

export type RequestNewEmailVerificationLinkResponse = ApiResponse;

export type GetNotificationsResponse = ApiResponse<{
  notifications: Notification[];
}>;
