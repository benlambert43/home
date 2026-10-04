import {
  blogHref,
  postHref,
  postImageHref,
  postShareImageHref,
} from "@/app/blog/links";
import JsonLd from "@/app/components/JsonLd";
import { BLOG_ID, breadcrumbList } from "@/app/lib/jsonLd";
import { siteUrl } from "@/app/lib/siteUrl";
import { Post, postExcerpt } from "@home/shared";

const postImages = ({ _id, headerImage }: Post) =>
  headerImage
    ? [
        postImageHref(_id, headerImage.name),
        postShareImageHref(_id, headerImage.name),
      ].map((path) => siteUrl(path))
    : undefined;

const postAuthor = ({ authorUsername }: Post) =>
  authorUsername === null
    ? undefined
    : { "@type": "Person", name: authorUsername };

const PostJsonLd = ({ post }: { post: Post }) => {
  const path = postHref(post._id);
  const url = siteUrl(path);

  return (
    <JsonLd
      graph={[
        {
          "@type": "BlogPosting",
          "@id": `${url}#post`,
          url,
          mainEntityOfPage: { "@type": "WebPage", "@id": url },
          isPartOf: { "@id": BLOG_ID },
          headline: post.title,
          description: postExcerpt(post.content),
          datePublished: post.createdDate,
          dateModified: post.modifiedDate,
          inLanguage: "en",
          author: postAuthor(post),
          image: postImages(post),
        },
        breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Blog", path: blogHref(1) },
          { name: post.title, path },
        ]),
      ]}
    />
  );
};

export default PostJsonLd;
