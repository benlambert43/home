import { siteUrl } from "@/app/lib/siteUrl";
import type { MetadataRoute } from "next";

const robots = (): MetadataRoute.Robots => ({
  rules: {
    userAgent: "*",
    allow: "/",
    disallow: [
      "/profile",
      "/settings",
      "/session",
      "/revalidate",
      "/blog/newPost",
      "/blog/*/edit",
      "/blog/uploads/",
    ],
  },
  sitemap: siteUrl("/sitemap.xml"),
});

export default robots;
