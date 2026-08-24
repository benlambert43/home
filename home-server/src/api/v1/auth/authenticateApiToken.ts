import * as jwt from "jsonwebtoken";
import { EncodedAccountJwt } from "@home/shared";

export type ApiTokenAuthentication =
  | { error: false; decodedToken: EncodedAccountJwt }
  | { error: true; errorMsg: string };

export const authenticateApiToken = (
  unverifiedToken?: string,
): ApiTokenAuthentication => {
  try {
    if (typeof unverifiedToken === "undefined") {
      throw new Error("No authorization token provided.");
    }

    const decoded = jwt.verify(unverifiedToken, process.env.TOKEN_ISSUER || "");

    return {
      error: false,
      decodedToken:
        typeof decoded === "string"
          ? (JSON.parse(decoded) as EncodedAccountJwt)
          : (decoded as EncodedAccountJwt),
    };
  } catch (e) {
    return {
      error: true,
      errorMsg: e instanceof Error ? e.message : "Unknown error.",
    };
  }
};
