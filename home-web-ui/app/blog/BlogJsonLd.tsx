import { blogHref } from "@/app/blog/links";
import JsonLd from "@/app/components/JsonLd";
import { BLOG_ID, breadcrumbList, WEBSITE_ID } from "@/app/lib/jsonLd";
import { BLOG_DESCRIPTION, BLOG_NAME } from "@/app/lib/metadata";
import { siteUrl } from "@/app/lib/siteUrl";

const BlogJsonLd = () => (
  <JsonLd
    graph={[
      {
        "@type": "Blog",
        "@id": BLOG_ID,
        url: siteUrl(blogHref(1)),
        name: BLOG_NAME,
        description: BLOG_DESCRIPTION,
        inLanguage: "en",
        isPartOf: { "@id": WEBSITE_ID },
      },
      breadcrumbList([
        { name: "Home", path: "/" },
        { name: "Blog", path: blogHref(1) },
      ]),
    ]}
  />
);

export default BlogJsonLd;
