import { BASE_SITE_URL } from "@/app/lib/serverEnv";
import type { Metadata } from "next";

const SITE_NAME = "ben lambert";
const SITE_DESCRIPTION = "ben lamberts personal website 🧑‍💻";

export const siteMetadata: Metadata = {
  metadataBase: new URL(BASE_SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
};

export const pageMetadata = (
  page: string,
  canonicalPath?: string,
): Metadata => ({
  title: `${SITE_NAME} - ${page}`,
  description: SITE_DESCRIPTION,
  ...(canonicalPath === undefined
    ? {}
    : { alternates: { canonical: canonicalPath } }),
});
