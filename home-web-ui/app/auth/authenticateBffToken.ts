import "server-only";
import { jwtVerify } from "jose";
import { EncodedAccountJwt } from "@home/shared";

export type AuthenticatedBffToken = {
  valid: boolean;
  message?: string;
  authenticatedUser?: EncodedAccountJwt;
};

export const authenticateBffToken = async (
  JwtStr?: string,
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

    if (encodedAccountJwtData.usage !== "BFF" || !encodedAccountJwtData.user) {
      throw new Error("The JWT is not a BFF session token.");
    }

    return { valid: true, authenticatedUser: encodedAccountJwtData };
  } catch (e) {
    return {
      valid: false,
      message: e instanceof Error ? e.message : "Unknown error.",
    };
  }
};
