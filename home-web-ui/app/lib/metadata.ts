import { BASE_SITE_URL } from "@/app/lib/serverEnv";
import type { Metadata } from "next";

const SITE_NAME = "ben lambert";
const SITE_DESCRIPTION = "ben lambert's personal website 🧑‍💻";

export const siteMetadata: Metadata = {
  metadataBase: new URL(BASE_SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
};

const HOME_DESCRIPTION =
  "home page of ben lambert's personal website. A place to share my projects and experiences.";

export const homeMetadata: Metadata = {
  title: SITE_NAME,
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: HOME_DESCRIPTION,
  },
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
