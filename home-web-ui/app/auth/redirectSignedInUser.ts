import "server-only";
import { getBffSessionUser } from "@/app/auth/getBffSessionUser";
import { DEFAULT_RETURN_PATH } from "@/app/auth/returnPath";
import { redirect } from "next/navigation";

export const redirectSignedInUser = async (returnTo = DEFAULT_RETURN_PATH) => {
  if (await getBffSessionUser()) redirect(returnTo);
};
