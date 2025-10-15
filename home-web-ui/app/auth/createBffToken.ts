"use server";

import "server-only";
import { SignJWT } from "jose";
import { EncodedAccountJwt, UserNoPassword } from "../types/types";

export const createBffToken = async (user: UserNoPassword) => {
  const BFF_SESSION_SECRET = process.env.BFF_SESSION_SECRET;
  const encodedBffKey = new TextEncoder().encode(BFF_SESSION_SECRET);

  if (typeof BFF_SESSION_SECRET !== "string" || BFF_SESSION_SECRET.length < 1) {
    throw new Error(
      "Could not create token, BFF_SESSION_SECRET is not defined.",
    );
  }

  const encodedAccountJwtData: EncodedAccountJwt = {
    usage: "BFF",
    user,
  };

  const token = new SignJWT(encodedAccountJwtData)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedBffKey);

  return token;
};
