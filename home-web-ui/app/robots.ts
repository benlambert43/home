import type { MetadataRoute } from "next";

const robots = (): MetadataRoute.Robots => ({
  rules: {
    userAgent: "*",
    allow: "/",
    disallow: ["/profile", "/settings", "/blog/newPost"],
  },
});

export default robots;
