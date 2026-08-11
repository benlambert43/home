import { Notification } from "./notification";
import { UserNoPassword } from "./user";

export interface ApiResponse {
  error: boolean;
  message: string;
}

export interface AuthenticatedUserResponse extends ApiResponse {
  jwt?: string;
  user?: UserNoPassword;
}

export type CreateAccountResponse = AuthenticatedUserResponse;

export type SignInResponse = AuthenticatedUserResponse;

export type ChangeUsernameResponse = AuthenticatedUserResponse;

export interface VerifyEmailResponse extends ApiResponse {
  newToken?: string;
  user?: UserNoPassword;
}

export type RequestNewEmailVerificationLinkResponse = ApiResponse;

export interface GetNotificationsResponse extends ApiResponse {
  notifications?: Notification[];
}
