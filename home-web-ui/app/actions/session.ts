"use server";
import { createBffToken } from "@/app/auth/createBffToken";
import { UserCookie, UserNoPassword } from "@/app/types/types";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const createSession = async (
  encodedApiJwtSession: string,
  user: UserNoPassword,
) => {
  const decodedJwt = jwtDecode(encodedApiJwtSession);
  const { exp, iat } = decodedJwt;
  if (typeof exp !== "number" || typeof iat !== "number")
    throw new Error("No exp or iat on token.");

  const expiresAt = new Date(exp * 1000);
  const issuedAt = new Date(iat * 1000);

  const plainTextUserCookie: UserCookie = {
    ...user,
    loginAt: new Date(),
    expiresAt,
    issuedAt,
  };

  const encodedBffJwtSession = await createBffToken(user);

  const cookieStore = await cookies();

  cookieStore.set("session", encodedApiJwtSession, {
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

  cookieStore.set("user", JSON.stringify(plainTextUserCookie), {
    expires: expiresAt,
  });
};

export const removeSession = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  cookieStore.delete("bffsession");
  cookieStore.delete("user");
  redirect("/signin");
};
