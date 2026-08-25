"use server";
import { createBffToken } from "@/app/auth/createBffToken";
import { UserNoPassword } from "@home/shared";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const createSession = async (
  encodedApiJwtSession: string,
  user: UserNoPassword,
) => {
  const { exp } = jwtDecode(encodedApiJwtSession);
  if (typeof exp !== "number") throw new Error("No exp on token.");

  const expiresAt = new Date(exp * 1000);

  const encodedBffJwtSession = await createBffToken(user);

  const cookieStore = await cookies();

  cookieStore.set("apisession", encodedApiJwtSession, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });

  cookieStore.set("bffsession", encodedBffJwtSession, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
};

export const removeSession = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("apisession");
  cookieStore.delete("bffsession");
  redirect("/signin");
};
