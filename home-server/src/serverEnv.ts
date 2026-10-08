import { apiSessionSecret } from "./api/v1/auth/apiSessionSecret";

const MAX_PORT = 65535;

const requireEnvironmentVariable = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not defined.`);
  }
  return value;
};

const requirePort = (name: string) => {
  const value = requireEnvironmentVariable(name);
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > MAX_PORT) {
    throw new Error(`${name} is not a valid port: ${value}`);
  }
  return port;
};

const requireUrl = (name: string) => {
  const value = requireEnvironmentVariable(name);
  if (!URL.canParse(value)) {
    throw new Error(`${name} is not a valid URL: ${value}`);
  }
  return value;
};

export const API_PORT = requirePort("API_PORT");

export const BASE_FRONTEND_URL = requireUrl("BASE_FRONTEND_URL");

const mongoAuth = () => {
  if (!process.env.MONGO_USERNAME && !process.env.MONGO_PASSWORD) {
    return undefined;
  }

  return {
    username: requireEnvironmentVariable("MONGO_USERNAME"),
    password: requireEnvironmentVariable("MONGO_PASSWORD"),
  };
};

export const MONGO_URI = requireEnvironmentVariable("MONGO_URI");

export const MONGO_AUTH = mongoAuth();

export const API_SESSION_SECRET = apiSessionSecret();

export const CAPTCHA_SECRET = requireEnvironmentVariable("CAPTCHA_SECRET");

export const EMAIL_OUTGOING_ADDRESS = requireEnvironmentVariable(
  "EMAIL_OUTGOING_ADDRESS",
);

export const EMAIL_OUTGOING_CLIENT_ID = requireEnvironmentVariable(
  "EMAIL_OUTGOING_CLIENT_ID",
);

export const EMAIL_OUTGOING_CLIENT_SECRET = requireEnvironmentVariable(
  "EMAIL_OUTGOING_CLIENT_SECRET",
);

export const EMAIL_OUTGOING_REFRESH_TOKEN = requireEnvironmentVariable(
  "EMAIL_OUTGOING_REFRESH_TOKEN",
);

export const EMAIL_OUTGOING_APP_PASSWORD = requireEnvironmentVariable(
  "EMAIL_OUTGOING_APP_PASSWORD",
);
