import "server-only";
import { BASE_SITE_URL } from "@/app/lib/serverEnv";

export const siteUrl = (path: string) => new URL(path, BASE_SITE_URL).href;
