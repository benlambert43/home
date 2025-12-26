import { EncodedAccountJwt } from "../../types/types";

export const handleRequestNewEmailVerificationLink = async ({
  decodedToken,
}: {
  decodedToken: EncodedAccountJwt;
}) => {
  console.log(decodedToken);
};
