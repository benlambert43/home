import { blogHref, postHref, postShareImageHref } from "@/app/blog/links";
import { PERSON_NAME } from "@/app/lib/person";
import { BASE_SITE_URL } from "@/app/lib/serverEnv";
import {
  Post,
  POST_SHARE_IMAGE_HEIGHT,
  POST_SHARE_IMAGE_WIDTH,
  postExcerpt,
} from "@home/shared";
import type { Metadata, ResolvingMetadata, Viewport } from "next";

export const SITE_NAME = "ben lambert";
const SITE_DESCRIPTION = "ben lambert's personal website 🧑‍💻";

export const siteMetadata: Metadata = {
  metadataBase: new URL(BASE_SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: { type: "website", siteName: SITE_NAME },
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

type ShareImages = NonNullable<Metadata["openGraph"]>["images"];

export const siteShareImages = async (
  parent: ResolvingMetadata,
): Promise<ShareImages> => (await parent).openGraph?.images ?? [];

const openGraphPage = (
  title: string,
  description: string,
  canonicalPath: string,
) => ({ siteName: SITE_NAME, title, description, url: canonicalPath });

const BLOG_TITLE = "blog";

const BLOG_DESCRIPTION =
  "the blog on ben lambert's personal website, where I post about my projects and experiences.";

export const blogMetadata = (
  page: number,
  siteImages: ShareImages,
): Metadata => {
  const canonicalPath = blogHref(page);
  const title = page > 1 ? `${BLOG_TITLE} - page ${page}` : BLOG_TITLE;
  const description =
    page > 1 ? `${BLOG_DESCRIPTION} Page ${page}.` : BLOG_DESCRIPTION;

  return {
    ...pageMetadata(title, { canonicalPath, description }),
    openGraph: {
      type: "website",
      ...openGraphPage(title, description, canonicalPath),
      images: siteImages,
    },
  };
};

export const unavailableBlogMetadata: Metadata = {
  ...pageMetadata(BLOG_TITLE),
  robots: { index: false },
};

const postShareImages = ({ _id, title, headerImage }: Post): ShareImages =>
  headerImage
    ? [
        {
          url: postShareImageHref(_id, headerImage.name),
          width: POST_SHARE_IMAGE_WIDTH,
          height: POST_SHARE_IMAGE_HEIGHT,
          alt: title,
        },
      ]
    : undefined;

export const postMetadata = (post: Post, siteImages: ShareImages): Metadata => {
  const canonicalPath = postHref(post._id);
  const description = postExcerpt(post.content) ?? SITE_DESCRIPTION;

  return {
    ...pageMetadata(post.title, { canonicalPath, description }),
    authors: [{ name: PERSON_NAME }],
    openGraph: {
      type: "article",
      ...openGraphPage(post.title, description, canonicalPath),
      publishedTime: post.createdDate,
      modifiedTime: post.modifiedDate,
      authors: [PERSON_NAME],
      images: postShareImages(post) ?? siteImages,
    },
  };
};
