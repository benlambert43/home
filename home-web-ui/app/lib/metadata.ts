import type { Metadata } from "next";

const SITE_NAME = "ben lambert";
const SITE_DESCRIPTION = "ben lamberts personal website 🧑‍💻";

export const siteMetadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
};

export const pageMetadata = (page: string): Metadata => ({
  title: `${SITE_NAME} - ${page}`,
  description: SITE_DESCRIPTION,
});
