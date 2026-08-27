export const ApiMessage = {
  INVALID_REQUEST: "Invalid request. Please check your details and try again.",
  UNEXPECTED: "Something went wrong. Please try again.",
  UNAUTHENTICATED:
    "Unable to authenticate request. Please sign in and try again.",
  NOT_IMPLEMENTED: "This endpoint is not implemented yet.",

  ACCOUNT_CREATED: "New account created.",
  SIGNED_IN: "Sign in successful.",
  INVALID_CREDENTIALS: "Error signing in. Email or password is incorrect.",
  CAPTCHA_FAILED:
    "Recaptcha challenge failed. Please reload the page and try again.",
  EMAIL_ALREADY_CONFIRMED: "You have already confirmed your email address.",
  EMAIL_CONFIRMED:
    "Thank you for confirming your email address! You can now close this window.",
  USERNAME_CHANGED: "Username updated.",
  USERNAME_NOT_ALLOWED:
    "That username isn't allowed. Please choose a different one.",
  ACCOUNT_DELETED: "Your account has been deleted.",
  PASSWORD_CHANGED: "Your password has been changed.",
  CURRENT_PASSWORD_INCORRECT:
    "Your current password is incorrect. Please try again.",
  NEW_PASSWORD_MUST_DIFFER:
    "Your new password must be different from your current password.",
  PASSWORD_RESET_LINK_SENT:
    "If an account exists for that email, a password reset link is on its way.",
  PASSWORD_RESET_LINK_INVALID:
    "This password reset link is not valid. Please request a new password reset link.",
  PASSWORD_RESET_LINK_EXPIRED:
    "This password reset link has expired. Please request a new password reset link.",
  VERIFICATION_LINK_EXPIRED:
    "Email verification link has expired. Please request a new email verification link.",
  VERIFICATION_LINK_INVALID:
    "Unable to update email verification status. Please request a new email verification link or try again.",
} as const;

export const accountAlreadyExists = (field: "email" | "username") =>
  `An account with this ${field} already exists.`;

export const pendingEmailVerification = (email: string, expiresAt: string) =>
  `You already have a pending email verification. Please check your ${email} account's spam and junk mail folders. You may send another email after ${expiresAt}.`;
