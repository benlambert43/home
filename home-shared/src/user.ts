export type UserRole = "user" | "admin";

export interface UserNoPassword {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  confirmedEmail: boolean;
  userBanned: boolean;
  createdDate: string;
  modifiedDate: string;
  role: UserRole;
}
