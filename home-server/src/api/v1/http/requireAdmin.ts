import { Response } from "express";
import { UserNoPassword } from "@home/shared";
import { authenticateAdmin } from "../auth/authenticateAdmin";
import { sendForbidden, sendUnauthenticated } from "./respond";

export const requireAdmin = async (
  authorization: string | undefined,
  res: Response,
): Promise<UserNoPassword | undefined> => {
  const authentication = await authenticateAdmin(authorization);

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
