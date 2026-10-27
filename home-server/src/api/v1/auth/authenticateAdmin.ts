import { authenticateUser, UserAuthentication } from "./authenticateUser";

export const authenticateAdmin = async (
  authorization?: string,
): Promise<UserAuthentication> => {
  const authentication = await authenticateUser(authorization);
  if (authentication.status !== "authenticated") return authentication;

  if (authentication.user.role !== "admin") return { status: "forbidden" };

  return authentication;
};
