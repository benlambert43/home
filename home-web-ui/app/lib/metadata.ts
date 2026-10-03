import { blogHref } from "@/app/blog/links";
import { BASE_SITE_URL } from "@/app/lib/serverEnv";
import type { Metadata, Viewport } from "next";

export const SITE_NAME = "ben lambert";
const SITE_DESCRIPTION = "ben lambert's personal website 🧑‍💻";

export const siteMetadata: Metadata = {
  metadataBase: new URL(BASE_SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
};

export const siteViewport: Viewport = {
  themeColor: "#1d293d",
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

type PageMetadataOptions = { canonicalPath?: string; description?: string };

export const pageMetadata = (
  page: string,
  { canonicalPath, description = SITE_DESCRIPTION }: PageMetadataOptions = {},
): Metadata => ({
  title: page,
  description,
  ...(canonicalPath === undefined
    ? {}
    : { alternates: { canonical: canonicalPath } }),
});

const BLOG_TITLE = "blog";

const BLOG_DESCRIPTION =
  "the blog on ben lambert's personal website, where I post about my projects and experiences.";

export const blogMetadata = (page: number): Metadata =>
  page > 1
    ? pageMetadata(`${BLOG_TITLE} - page ${page}`, {
        canonicalPath: blogHref(page),
        description: `${BLOG_DESCRIPTION} Page ${page}.`,
      })
    : pageMetadata(BLOG_TITLE, {
        canonicalPath: blogHref(page),
        description: BLOG_DESCRIPTION,
      });

export const unavailableBlogMetadata: Metadata = {
  ...pageMetadata(BLOG_TITLE),
  robots: { index: false },
};
