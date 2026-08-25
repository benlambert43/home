import * as jwt from "jsonwebtoken";
import { EncodedAccountJwt } from "@home/shared";
import { SerializableUser, serializeUser } from "../types/serialize";
import { apiSessionSecret } from "./apiSessionSecret";

export const createApiToken = (user: SerializableUser) =>
  jwt.sign(
    { usage: "API", user: serializeUser(user) } satisfies EncodedAccountJwt,
    apiSessionSecret(),
    { expiresIn: "7d" },
  );
