import * as jwt from "jsonwebtoken";
import { EncodedAccountJwt } from "@home/shared";
import { SerializableUser, serializeUser } from "../types/serialize";

export const createApiToken = (user: SerializableUser) => {
  const jwtTokenIssuer = process.env.TOKEN_ISSUER;
  if (typeof jwtTokenIssuer !== "string" || jwtTokenIssuer.length < 1) {
    throw new Error("Could not create token, TOKEN_ISSUER is not defined.");
  }

  const encodedAccountJwtData: EncodedAccountJwt = {
    usage: "API",
    user: serializeUser(user),
  };

  const token = jwt.sign(encodedAccountJwtData, jwtTokenIssuer, {
    expiresIn: "7d",
  });

  return token;
};
