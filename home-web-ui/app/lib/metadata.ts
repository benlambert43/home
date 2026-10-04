import { blogHref, postHref, postShareImageHref } from "@/app/blog/links";
import { BASE_SITE_URL } from "@/app/lib/serverEnv";
import { Post } from "@home/shared";
import type { Metadata, ResolvingMetadata, Viewport } from "next";

export const SITE_NAME = "benlambert.tech";
const SITE_DESCRIPTION = "my personal website, with a blog and projects 🧑‍💻";

export const siteMetadata: Metadata = {
  metadataBase: new URL(BASE_SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  openGraph: { type: "website", siteName: SITE_NAME },
};

export const siteViewport: Viewport = {
  themeColor: "#1d293d",
};

const HOME_DESCRIPTION = "A place to share my projects and experiences.";

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

export const BLOG_NAME = `${SITE_NAME} blog`;

export const BLOG_DESCRIPTION = "blog posts about my projects and experiences.";

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

const postShareImages = ({
  slug,
  title,
  headerImage,
  headerImageAlt,
  shareImage,
}: Post): ShareImages =>
  headerImage
    ? [
        {
          url: postShareImageHref(slug, headerImage.name),
          alt: headerImageAlt ?? title,
          ...shareImage,
        },
      ]
    : undefined;

export const postMetadata = (post: Post, siteImages: ShareImages): Metadata => {
  const canonicalPath = postHref(post.slug);
  const description = post.excerpt ?? SITE_DESCRIPTION;
  const authors =
    post.authorUsername === null ? undefined : [post.authorUsername];

  return {
    ...pageMetadata(post.title, { canonicalPath, description }),
    authors: authors?.map((name) => ({ name })),
    openGraph: {
      type: "article",
      ...openGraphPage(post.title, description, canonicalPath),
      publishedTime: post.createdDate,
      modifiedTime: post.modifiedDate,
      authors,
      images: postShareImages(post) ?? siteImages,
    },
  };
};
