import { Router } from "express";
import {
  changeEmailConsentBodySchema,
  changePasswordBodySchema,
  changeUsernameBodySchema,
  CreateAccountResponse,
  createAccountBodySchema,
  passwordResetLinkParamsSchema,
  requestNewEmailVerificationLinkBodySchema,
  requestPasswordResetBodySchema,
  resetPasswordBodySchema,
  verifyEmailParamsSchema,
} from "@home/shared";
import { parseRequest } from "../http/parseRequest";
import {
  sendFailure,
  sendResult,
  sendSuccess,
  sendUnauthenticated,
} from "../http/respond";
import { accountAlreadyExists, ApiMessage } from "../http/messages";
import { route } from "../http/router";
import {
  createNewUniqueRandomUsername,
  handleCreateAccount,
} from "./handlers/handleCreateAccount";
import { checkUniqueEmail, checkUniqueUsername } from "../user/userQueries";
import { usernameHasProfanity } from "../user/usernameFilter";
import { serializeUser } from "../types/serialize";
import { handleSendEmailVerification } from "../email/handleSendEmailVerification";
import { handleVerifyEmailCallback } from "./handlers/handleVerifyEmailCallback";
import { verifyCaptcha } from "../auth/verifyCaptcha";
import { authenticateApiToken } from "../auth/authenticateApiToken";
import { handleRequestNewEmailVerificationLink } from "./handlers/handleRequestNewEmailVerificationLink";
import { createNewNotification } from "../notification/handlers/createNewNotification";
import { handleChangeUsername } from "./handlers/handleChangeUsername";
import { handleChangeEmailConsent } from "./handlers/handleChangeEmailConsent";
import { handleChangePassword } from "./handlers/handleChangePassword";
import { handleRequestPasswordReset } from "./handlers/handleRequestPasswordReset";
import { handleCheckPasswordResetLink } from "./handlers/handleCheckPasswordResetLink";
import { handleResetPassword } from "./handlers/handleResetPassword";
import { handleDeleteAccount } from "./handlers/handleDeleteAccount";
import { frontendUrl } from "../http/frontendUrl";

interface VerifyEmailParams {
  code: string;
}

interface PasswordResetLinkParams {
  code: string;
}

const accountManagementRouter = Router();

accountManagementRouter.post(
  "/createAccount",
  route(async (req, res) => {
    const body = parseRequest(createAccountBodySchema, req.body, res);
    if (!body) return;

    if (!(await verifyCaptcha(body.grecaptcharesponse))) {
      return sendFailure(res, ApiMessage.CAPTCHA_FAILED);
    }

    const emailAvailable = await checkUniqueEmail(body.email);
    if (!emailAvailable) return sendFailure(res, accountAlreadyExists("email"));

    const username = await createNewUniqueRandomUsername();
    if (!username) return sendFailure(res);

    const { grecaptcharesponse, ...account } = body;
    const { token, user } = await handleCreateAccount({ ...account, username });

    await createNewNotification({
      recipientUserId: user._id,
      subtype: "confirmEmail",
      message: "Please check your inbox to confirm your email.",
      referenceLink: frontendUrl("profile").toString(),
      canBeMarkedAsRead: false,
      canBeDeleted: false,
    });

    handleSendEmailVerification(user).catch((e: unknown) => {
      console.error("Failed to send account verification email:", e);
    });

    sendSuccess<CreateAccountResponse>(res, {
      message: ApiMessage.ACCOUNT_CREATED,
      jwt: token,
      user: serializeUser(user),
    });
  }),
);

accountManagementRouter.get(
  "/verifyEmail/:code",
  route<VerifyEmailParams>(async (req, res) => {
    const params = verifyEmailParamsSchema.safeParse({
      code: req.params.code,
    });

    if (!params.success) {
      return sendFailure(res, ApiMessage.VERIFICATION_LINK_INVALID);
    }

    sendResult(res, await handleVerifyEmailCallback(params.data.code));
  }),
);

accountManagementRouter.post(
  "/requestNewEmailVerificationLink",
  route(async (req, res) => {
    const token = authenticateApiToken(req.headers?.authorization);
    if (!token) return sendUnauthenticated(res);

    const body = parseRequest(
      requestNewEmailVerificationLinkBodySchema,
      req.body,
      res,
    );
    if (!body) return;

    if (!(await verifyCaptcha(body.grecaptcharesponse))) {
      return sendFailure(res, ApiMessage.CAPTCHA_FAILED);
    }

    sendResult(res, await handleRequestNewEmailVerificationLink(token));
  }),
);

accountManagementRouter.post(
  "/changeUsername",
  route(async (req, res) => {
    const token = authenticateApiToken(req.headers?.authorization);
    if (!token) return sendUnauthenticated(res);

    const body = parseRequest(changeUsernameBodySchema, req.body, res);
    if (!body) return;

    if (usernameHasProfanity(body.newUsername)) {
      return sendFailure(res, ApiMessage.USERNAME_NOT_ALLOWED);
    }

    const available = await checkUniqueUsername(
      body.newUsername,
      token.user._id,
    );
    if (!available) return sendFailure(res, accountAlreadyExists("username"));

    sendResult(res, await handleChangeUsername(token, body.newUsername));
  }),
);

accountManagementRouter.post(
  "/changeEmailConsent",
  route(async (req, res) => {
    const token = authenticateApiToken(req.headers?.authorization);
    if (!token) return sendUnauthenticated(res);

    const body = parseRequest(changeEmailConsentBodySchema, req.body, res);
    if (!body) return;

    sendResult(res, await handleChangeEmailConsent(token, body));
  }),
);

accountManagementRouter.post(
  "/changePassword",
  route(async (req, res) => {
    const token = authenticateApiToken(req.headers?.authorization);
    if (!token) return sendUnauthenticated(res);

    const body = parseRequest(changePasswordBodySchema, req.body, res);
    if (!body) return;

    sendResult(res, await handleChangePassword(token, body));
  }),
);

accountManagementRouter.post(
  "/requestPasswordReset",
  route(async (req, res) => {
    const body = parseRequest(requestPasswordResetBodySchema, req.body, res);
    if (!body) return;

    if (!(await verifyCaptcha(body.grecaptcharesponse))) {
      return sendFailure(res, ApiMessage.CAPTCHA_FAILED);
    }

    sendResult(res, await handleRequestPasswordReset(body));
  }),
);

accountManagementRouter.get(
  "/passwordResetLink/:code",
  route<PasswordResetLinkParams>(async (req, res) => {
    const params = passwordResetLinkParamsSchema.safeParse({
      code: req.params.code,
    });

    if (!params.success) {
      return sendFailure(res, ApiMessage.PASSWORD_RESET_LINK_INVALID);
    }

    sendResult(res, await handleCheckPasswordResetLink(params.data.code));
  }),
);

accountManagementRouter.post(
  "/resetPassword",
  route(async (req, res) => {
    const body = parseRequest(resetPasswordBodySchema, req.body, res);
    if (!body) return;

    sendResult(res, await handleResetPassword(body));
  }),
);

accountManagementRouter.post(
  "/deleteAccount",
  route(async (req, res) => {
    const token = authenticateApiToken(req.headers?.authorization);
    if (!token) return sendUnauthenticated(res);

    sendResult(res, await handleDeleteAccount(token));
  }),
);

export default accountManagementRouter;
