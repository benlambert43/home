import { Router } from "express";
import { CreateAccountResponse } from "@home/shared";
import { parseRequest } from "../http/parseRequest";
import {
  sendFailure,
  sendResult,
  sendSuccess,
  sendUnauthenticated,
} from "../http/respond";
import { accountAlreadyExists, ApiMessage } from "../http/messages";
import {
  changeUsernameBodySchema,
  createAccountBodySchema,
  requestNewEmailVerificationLinkBodySchema,
  verifyEmailParamsSchema,
} from "../http/requestSchemas";
import {
  createNewUniqueRandomUsername,
  handleCreateAccount,
} from "./handlers/handleCreateAccount";
import { checkUniqueEmail, checkUniqueUsername } from "../user/userQueries";
import { serializeUser } from "../types/serialize";
import { handleSendEmailVerification } from "../email/handlers/handleSendEmailVerification";
import { decodeUrlSafeB64 } from "../email/handlers/encodeUrlSafeB64";
import { handleVerifyEmailCallback } from "./handlers/handleVerifyEmailCallback";
import { handleVerifyCaptcha } from "../auth/verifyCaptcha";
import { authenticateApiToken } from "../auth/authenticateApiToken";
import { handleRequestNewEmailVerificationLink } from "./handlers/handleRequestNewEmailVerificationLink";
import { createNewNotification } from "../notification/handlers/createNewNotification";
import { handleChangeUsername } from "./handlers/handleChangeUsernameResponse";

const BASE_FRONTEND_URL = process.env.BASE_FRONTEND_URL;

const accountManagementRouter = Router();

accountManagementRouter.get("/", (req, res) => {
  res.status(200).send({ message: "Account Management Router" });
});

accountManagementRouter.post("/createAccount", async (req, res) => {
  try {
    const body = parseRequest(createAccountBodySchema, req.body, res);
    if (!body) return;

    const captcha = await handleVerifyCaptcha(body.grecaptcharesponse);
    if (!captcha.success) return sendFailure(res, ApiMessage.CAPTCHA_FAILED);

    const username = await createNewUniqueRandomUsername();
    if (!username) return sendFailure(res);

    const emailAvailable = await checkUniqueEmail(body.email);
    if (!emailAvailable) return sendFailure(res, accountAlreadyExists("email"));

    const { grecaptcharesponse, ...account } = body;
    const { token, user } = await handleCreateAccount({ ...account, username });

    await createNewNotification({
      recipientUserId: user._id,
      subtype: "confirmEmail",
      message: "Please check your inbox to confirm your email.",
      referenceLink: `${BASE_FRONTEND_URL}profile`,
      canBeMarkedAsRead: false,
      canBeDeleted: false,
    });

    handleSendEmailVerification(user);

    sendSuccess<CreateAccountResponse>(res, {
      message: ApiMessage.ACCOUNT_CREATED,
      jwt: token,
      user: serializeUser(user),
    });
  } catch (e) {
    sendFailure(res);
  }
});

accountManagementRouter.get(
  "/verifyEmail/:username/:email/:code",
  async (req, res) => {
    try {
      const params = parseRequest(
        verifyEmailParamsSchema,
        {
          username: decodeUrlSafeB64(req.params.username),
          email: decodeUrlSafeB64(req.params.email),
          code: req.params.code,
        },
        res,
      );
      if (!params) return;

      sendResult(res, await handleVerifyEmailCallback(params));
    } catch (e) {
      sendFailure(res, ApiMessage.VERIFICATION_LINK_INVALID);
    }
  },
);

accountManagementRouter.post(
  "/requestNewEmailVerificationLink",
  async (req, res) => {
    try {
      const verifiedToken = authenticateApiToken(req.headers?.authorization);
      if (verifiedToken.error) return sendUnauthenticated(res);

      const body = parseRequest(
        requestNewEmailVerificationLinkBodySchema,
        req.body,
        res,
      );
      if (!body) return;

      const captcha = await handleVerifyCaptcha(body.grecaptcharesponse);
      if (!captcha.success) return sendFailure(res, ApiMessage.CAPTCHA_FAILED);

      sendResult(
        res,
        await handleRequestNewEmailVerificationLink(verifiedToken.decodedToken),
      );
    } catch (e) {
      sendFailure(res);
    }
  },
);

accountManagementRouter.post("/changeUsername", async (req, res) => {
  try {
    const verifiedToken = authenticateApiToken(req.headers?.authorization);
    if (verifiedToken.error) return sendUnauthenticated(res);

    const body = parseRequest(changeUsernameBodySchema, req.body, res);
    if (!body) return;

    const available = await checkUniqueUsername(body.newUsername);
    if (!available) return sendFailure(res, accountAlreadyExists("username"));

    sendResult(
      res,
      await handleChangeUsername(verifiedToken.decodedToken, body.newUsername),
    );
  } catch (e) {
    sendFailure(res);
  }
});

export default accountManagementRouter;
