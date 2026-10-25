import "server-only";
import { UserNoPassword } from "@home/shared";
import { getBffSessionUser } from "@/app/auth/getBffSessionUser";
import { signInHref } from "@/app/auth/returnPath";
import { redirect } from "next/navigation";

export const requireBffSessionUser = async (
  returnTo: string,
): Promise<UserNoPassword> => {
  const user = await getBffSessionUser();
  if (!user) redirect(signInHref(returnTo));
  return user;
};
