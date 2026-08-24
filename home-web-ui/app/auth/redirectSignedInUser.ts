import "server-only";
import { getBffSessionUser } from "@/app/auth/getBffSessionUser";
import { redirect } from "next/navigation";

export const redirectSignedInUser = async () => {
  if (await getBffSessionUser()) redirect("/profile");
};
