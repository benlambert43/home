import "server-only";
import { SignJWT } from "jose";
import { EncodedAccountJwt, UserNoPassword } from "@home/shared";

export const createBffToken = async (user: UserNoPassword) => {
  const BFF_SESSION_SECRET = process.env.BFF_SESSION_SECRET;

  if (typeof BFF_SESSION_SECRET !== "string" || BFF_SESSION_SECRET.length < 1) {
    throw new Error(
      "Could not create token, BFF_SESSION_SECRET is not defined.",
    );
  }

  return new SignJWT({ usage: "BFF", user } satisfies EncodedAccountJwt)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(BFF_SESSION_SECRET));
};
