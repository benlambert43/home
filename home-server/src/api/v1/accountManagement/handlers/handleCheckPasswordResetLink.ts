import { CheckPasswordResetLinkResponse } from "@home/shared";
import { findPasswordReset } from "../../auth/findPasswordReset";

export const handleCheckPasswordResetLink = async (
  code: string,
): Promise<CheckPasswordResetLinkResponse> => {
  const found = await findPasswordReset(code);

  return found.error ? found : { error: false };
};
