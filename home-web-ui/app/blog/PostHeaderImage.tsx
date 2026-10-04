import { postFullSizeImageHref, postImageHref } from "@/app/blog/links";
import PostFullSizeImageLink from "@/app/blog/PostFullSizeImageLink";
import { postImageSizing } from "@/app/blog/postImageSizes";
import { PostSummary } from "@home/shared";
import Image from "next/image";

const PostHeaderImage = ({ post }: { post: PostSummary }) => {
  const image = post.headerImage;
  const alt = post.headerImageAlt ?? "";

  if (!image) return null;

  return (
    <PostFullSizeImageLink
      href={postFullSizeImageHref(post.slug, image.name)}
      alt={alt}
    >
      <Image
        src={postImageHref(post.slug, image.name)}
        alt={alt}
        width={image.width}
        height={image.height}
        loading="eager"
        fetchPriority="high"
        {...postImageSizing(image)}
      />
    </PostFullSizeImageLink>
  );
};

export default PostHeaderImage;
