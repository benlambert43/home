import { UserNoPassword } from "@home/shared";
import { UserModel } from "../model/userModel";
import { serializeUser } from "../types/serialize";
import { authenticateApiToken } from "./authenticateApiToken";

type AdminAuthentication =
  | { status: "unauthenticated" }
  | { status: "forbidden" }
  | { status: "authenticated"; user: UserNoPassword };

export const authenticateAdmin = async (
  authorization?: string,
): Promise<AdminAuthentication> => {
  const token = authenticateApiToken(authorization);
  if (!token) return { status: "unauthenticated" };

  const user = await UserModel.findById(token.user._id);
  if (!user) return { status: "unauthenticated" };

  if (user.userBanned || user.role !== "admin") return { status: "forbidden" };

  return { status: "authenticated", user: serializeUser(user) };
};
