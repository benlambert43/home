export const ApiMessage = {
  INVALID_REQUEST: "Invalid request. Please check your details and try again.",
  UNEXPECTED: "Something went wrong. Please try again.",
  UNAUTHENTICATED:
    "Unable to authenticate request. Please sign in and try again.",
  NOT_IMPLEMENTED: "This endpoint is not implemented yet.",
  FORBIDDEN: "You do not have permission to do that.",

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
  POST_CREATED: "Post published.",
  POST_UPDATED: "Post updated.",
  POST_DELETED: "Post deleted.",
  POST_NOT_FOUND: "That post could not be found.",
  POST_IMAGE_INVALID:
    "Header image must be a PNG, JPEG, WebP, GIF, or AVIF image.",
  POST_FILES_UNAVAILABLE:
    "This post's files could not be read from storage. Please try again.",
  POST_HAS_NO_REVISION:
    "This post has no saved content. Please try again, or edit the post to republish it.",
} as const;

export const accountAlreadyExists = (field: "email" | "username") =>
  `An account with this ${field} already exists.`;

export const inlineImageNotAnImage = (name: string) =>
  `${name} is not a PNG, JPEG, WebP, GIF, or AVIF image.`;

export const inlineImageTypeMismatch = (name: string) =>
  `The contents of ${name} do not match the file extension in its name.`;

export const inlineImageNotOnPost = (name: string) =>
  `${name} is not an image on this post.`;

export const pendingEmailVerification = (email: string, expiresAt: string) =>
  `You already have a pending email verification. Please check your ${email} account's spam and junk mail folders. You may send another email after ${expiresAt}.`;
