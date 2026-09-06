import "server-only";
import { SignJWT } from "jose";
import { EncodedAccountJwt, UserNoPassword } from "@home/shared";
import { BFF_SESSION_SECRET } from "@/app/lib/serverEnv";

export const createBffToken = async (user: UserNoPassword) =>
  new SignJWT({ usage: "BFF", user } satisfies EncodedAccountJwt)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(BFF_SESSION_SECRET));
