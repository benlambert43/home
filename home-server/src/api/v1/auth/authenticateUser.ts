import { UserNoPassword } from "@home/shared";
import { UserModel } from "../model/userModel";
import { serializeUser } from "../types/serialize";
import { authenticateApiToken } from "./authenticateApiToken";

export type UserAuthentication =
  | { status: "unauthenticated" }
  | { status: "forbidden" }
  | { status: "authenticated"; user: UserNoPassword };

export const authenticateUser = async (
  authorization?: string,
): Promise<UserAuthentication> => {
  const token = authenticateApiToken(authorization);
  if (!token) return { status: "unauthenticated" };

  const user = await UserModel.findById(token.user._id);
  if (!user) return { status: "unauthenticated" };

  if (user.userBanned) return { status: "forbidden" };

  return { status: "authenticated", user: serializeUser(user) };
};
