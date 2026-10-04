import "server-only";
import { siteUrl } from "@/app/lib/siteUrl";

export const WEBSITE_ID = siteUrl("/#website");

export const BLOG_ID = siteUrl("/blog#blog");

type Breadcrumb = { name: string; path: string };

export const breadcrumbList = (breadcrumbs: Breadcrumb[]) => ({
  "@type": "BreadcrumbList",
  itemListElement: breadcrumbs.map(({ name, path }, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name,
    item: siteUrl(path),
  })),
});
