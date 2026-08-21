import "server-only";
import { cookies } from "next/headers";
import { UserNoPassword } from "@home/shared";
import { authenticateBffToken } from "@/app/auth/authenticateBffToken";

export const getBffSessionUser = async (): Promise<UserNoPassword | null> => {
  const cookieStore = await cookies();
  const bffSessionCookie = cookieStore.get("bffsession");

  const { valid, authenticatedUser } = await authenticateBffToken(
    bffSessionCookie?.value,
  );

  return valid && authenticatedUser ? authenticatedUser.user : null;
};
