import "server-only";
import { cookies } from "next/headers";
import { UserNoPassword } from "@home/shared";
import { authenticateBffToken } from "@/app/auth/authenticateBffToken";

export const getBffSessionUser = async (): Promise<UserNoPassword | null> => {
  const { valid, authenticatedUser } = await authenticateBffToken(
    (await cookies()).get("bffsession")?.value,
  );

  return valid && authenticatedUser ? authenticatedUser.user : null;
};
