import "server-only";
import { jwtVerify } from "jose";
import { EncodedAccountJwt } from "@home/shared";
import { BFF_SESSION_SECRET } from "@/app/lib/serverEnv";

export type AuthenticatedBffToken =
  | { valid: true; authenticatedUser: EncodedAccountJwt }
  | { valid: false; message: string };

export const authenticateBffToken = async (
  jwtStr?: string,
): Promise<AuthenticatedBffToken> => {
  if (!jwtStr) {
    return { valid: false, message: "No JWT was provided." };
  }

  try {
    const encodedAccountJwtData = (
      await jwtVerify(jwtStr, new TextEncoder().encode(BFF_SESSION_SECRET), {
        algorithms: ["HS256"],
      })
    ).payload as EncodedAccountJwt;

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
