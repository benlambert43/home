import * as jwt from "jsonwebtoken";
import { EncodedAccountJwt } from "@home/shared";
import { SerializableUser, serializeUser } from "../types/serialize";

export const createApiToken = (user: SerializableUser) => {
  const apiSessionSecret = process.env.API_SESSION_SECRET;
  if (typeof apiSessionSecret !== "string" || apiSessionSecret.length < 1) {
    throw new Error(
      "Could not create token, API_SESSION_SECRET is not defined.",
    );
  }

  return jwt.sign(
    { usage: "API", user: serializeUser(user) } satisfies EncodedAccountJwt,
    apiSessionSecret,
    { expiresIn: "7d" },
  );
};
