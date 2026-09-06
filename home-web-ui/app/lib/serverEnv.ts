import "server-only";
import { requireEnvironmentVariable } from "@/app/lib/publicEnv";

export const BASE_API_URL = requireEnvironmentVariable(
  "BASE_API_URL",
  process.env.BASE_API_URL,
);

export const BASE_SITE_URL = requireEnvironmentVariable(
  "BASE_SITE_URL",
  process.env.BASE_SITE_URL,
);

export const BFF_SESSION_SECRET = requireEnvironmentVariable(
  "BFF_SESSION_SECRET",
  process.env.BFF_SESSION_SECRET,
);
