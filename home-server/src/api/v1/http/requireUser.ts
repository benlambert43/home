import { Response } from "express";
import { UserNoPassword } from "@home/shared";
import { authenticateUser } from "../auth/authenticateUser";
import { sendForbidden, sendUnauthenticated } from "./respond";

export const requireUser = async (
  authorization: string | undefined,
  res: Response,
): Promise<UserNoPassword | undefined> => {
  const authentication = await authenticateUser(authorization);

  if (authentication.status === "unauthenticated") {
    sendUnauthenticated(res);
    return undefined;
  }

  if (authentication.status === "forbidden") {
    sendForbidden(res);
    return undefined;
  }

  return authentication.user;
};
