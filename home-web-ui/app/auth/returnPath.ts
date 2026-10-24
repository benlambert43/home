export const RETURN_TO = "returnTo";

export const DEFAULT_RETURN_PATH = "/profile";

const MAX_RETURN_PATH_LENGTH = 2000;

const LOCAL_PATH = /^\/(?![/\\])\S*$/;

const SIGN_IN_PATH = /^\/signin(?:[/?#]|$)/;

export const localReturnPath = (value: unknown) =>
  typeof value === "string" &&
  value.length <= MAX_RETURN_PATH_LENGTH &&
  LOCAL_PATH.test(value) &&
  !SIGN_IN_PATH.test(value)
    ? value
    : DEFAULT_RETURN_PATH;

export const signInHref = (returnTo: string) =>
  returnTo === DEFAULT_RETURN_PATH
    ? "/signin"
    : `/signin?${RETURN_TO}=${encodeURIComponent(returnTo)}`;
