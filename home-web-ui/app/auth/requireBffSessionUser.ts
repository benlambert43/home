import "server-only";
import { UserNoPassword } from "@home/shared";
import { getBffSessionUser } from "@/app/auth/getBffSessionUser";
import { redirect } from "next/navigation";

export const requireBffSessionUser = async (): Promise<UserNoPassword> => {
  const user = await getBffSessionUser();
  if (!user) redirect("/signin");
  return user;
};
