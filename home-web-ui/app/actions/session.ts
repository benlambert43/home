"use server";
import { clearSession } from "@/app/auth/sessionCookies";
import { redirect } from "next/navigation";

export const logOut = async () => {
  await clearSession();
  redirect("/signin");
};
