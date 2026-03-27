import * as jwt from "jsonwebtoken";
import { User, EncodedAccountJwt, UserNoPassword } from "../types/types";
import { removePasswordFromUserObject } from "../accountManagement/handlers/handleCreateAccount";

export const createApiToken = (user: User) => {
  const jwtTokenIssuer = process.env.TOKEN_ISSUER;
  if (typeof jwtTokenIssuer !== "string" || jwtTokenIssuer.length < 1) {
    throw new Error("Could not create token, TOKEN_ISSUER is not defined.");
  }

  const userRemovePassword = removePasswordFromUserObject(user);

  const encodedAccountJwtData: EncodedAccountJwt = {
    usage: "API",
    user: userRemovePassword,
  };

  const token = jwt.sign(encodedAccountJwtData, jwtTokenIssuer, {
    expiresIn: "7d",
  });

  return token;
};
