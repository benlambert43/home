import * as jwt from "jsonwebtoken";
import { EncodedAccountJwt } from "../types/types";

export const authenticateApiToken = (unverifiedCaptchaToken: string) => {
  const secret = process.env.TOKEN_ISSUER || "";
  try {
    const decode = jwt.verify(unverifiedCaptchaToken, secret);

    if (typeof decode === "string") {
      const decodedTokenString: EncodedAccountJwt = JSON.parse(decode);
      return { error: false, errorMsg: "", decodedToken: decodedTokenString };
    }

    const encodedDataFromJwt = {
      error: false,
      errorMsg: "",
      decodedToken: decode as EncodedAccountJwt,
    };
    return encodedDataFromJwt;
  } catch (e) {
    const errorMsgStr = () => {
      try {
        const stringErr = JSON.stringify(e, undefined, " ");
        return stringErr;
      } catch {
        return "Unknown error.";
      }
    };
    return { error: true, errorMsg: errorMsgStr(), decodedToken: undefined };
  }
};
