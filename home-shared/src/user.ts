export const MAX_USERNAME_CHARACTERS = 30;

export type UserRole = "user" | "admin";

export interface Consent<Timestamp = string> {
  agreed: boolean;
  timestamp: Timestamp;
}

export interface UserFields<Id = string, Timestamp = string> {
  _id: Id;
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  confirmedEmail: boolean;
  userBanned: boolean;
  createdDate: Timestamp;
  modifiedDate: Timestamp;
  role: UserRole;
  termsConsent: Consent<Timestamp>;
  newsletterConsent: Consent<Timestamp>;
  marketingConsent: Consent<Timestamp>;
}

export type UserNoPassword = UserFields;
