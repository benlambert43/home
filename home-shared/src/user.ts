export type UserRole = "user" | "admin";

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
}

export type UserNoPassword = UserFields;
