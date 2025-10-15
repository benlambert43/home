"use server";

import "server-only";
import { jwtVerify } from "jose";
import { EncodedAccountJwt } from "../types/types";

export type AuthenticatedBffToken = {
  valid: boolean;
  message?: string;
  authenticatedUser?: EncodedAccountJwt;
};

export const authenticateBffToken = async (
  JwtStr?: string
): Promise<AuthenticatedBffToken> => {
  const BFF_SESSION_SECRET = process.env.BFF_SESSION_SECRET;
  const encodedBffKey = new TextEncoder().encode(BFF_SESSION_SECRET);

  if (!JwtStr) {
    return { valid: false, message: "No JWT was provided." };
  }

  try {
    if (
      typeof BFF_SESSION_SECRET !== "string" ||
      BFF_SESSION_SECRET.length < 1
    ) {
      throw new Error("Failed to parse environment variable secret.");
    }

    const decodedJwt = await jwtVerify(JwtStr, encodedBffKey, {
      algorithms: ["HS256"],
    });
    const encodedAccountJwtData = decodedJwt.payload as EncodedAccountJwt;
    return { valid: true, authenticatedUser: encodedAccountJwtData };
  } catch (e) {
    const errorMsgStr = () => {
      try {
        const stringErr = JSON.stringify(e, undefined, " ");
        return stringErr;
      } catch {
        return "Unknown error while parsing the JWT validation error string.";
      }
    };

    return { valid: false, message: errorMsgStr() };
  }
};
