import * as jwt from "jsonwebtoken";
import { EncodedAccountJwt } from "@home/shared";
import { apiSessionSecret } from "./apiSessionSecret";

export const authenticateApiToken = (
  unverifiedToken?: string,
): EncodedAccountJwt | null => {
  if (!unverifiedToken) return null;

  try {
    const verified = jwt.verify(unverifiedToken, apiSessionSecret());

    const decoded =
      typeof verified === "string"
        ? (JSON.parse(verified) as EncodedAccountJwt)
        : (verified as EncodedAccountJwt);

    return decoded.usage === "API" && decoded.user ? decoded : null;
  } catch {
    return null;
  }
};
