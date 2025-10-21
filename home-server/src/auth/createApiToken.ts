import * as jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
import { User, EncodedAccountJwt, UserNoPassword } from "../types/types";

configDotenv();

export const createApiToken = (user: User) => {
  const jwtTokenIssuer = process.env.TOKEN_ISSUER;
  if (typeof jwtTokenIssuer !== "string" || jwtTokenIssuer.length < 1) {
    throw new Error("Could not create token, TOKEN_ISSUER is not defined.");
  }

  const userRemovePassword: UserNoPassword = {
    _id: user._id,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    username: user.username,
    createdDate: user.createdDate,
    modifiedDate: user.modifiedDate,
    role: user.role,
  };

  const encodedAccountJwtData: EncodedAccountJwt = {
    usage: "API",
    user: userRemovePassword,
  };

  const token = jwt.sign(encodedAccountJwtData, jwtTokenIssuer, {
    expiresIn: "7d",
  });

  return token;
};
