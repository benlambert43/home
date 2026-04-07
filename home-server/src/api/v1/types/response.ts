import { Notification, UserNoPassword } from "./types";

export type CreateAccountResponse = {
  error: boolean;
  message: string;
  jwt?: string;
  user?: UserNoPassword;
};

export type SignInResponse = {
  error: boolean;
  message: string;
  jwt?: string;
  user?: UserNoPassword;
};

export type VerifyEmailResponse = {
  error: boolean;
  message: string;
  newToken?: string;
  user?: UserNoPassword;
};

export type RequestNewEmailVerificationLinkResponse = {
  error: boolean;
  message: string;
};

export type GetNotificationsResponse = {
  error: boolean;
  message: string;
  notifications?: Notification[];
};
