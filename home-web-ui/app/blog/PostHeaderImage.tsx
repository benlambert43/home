import { postFullSizeImageHref, postImageHref } from "@/app/blog/links";
import PostFullSizeImageLink from "@/app/blog/PostFullSizeImageLink";
import { POST_IMAGE_SIZES } from "@/app/blog/postImageSizes";
import { PostSummary } from "@home/shared";
import Image from "next/image";

const PostHeaderImage = ({ post }: { post: PostSummary }) => {
  const image = post.headerImage;

  if (!image) return null;

  return (
    <PostFullSizeImageLink
      href={postFullSizeImageHref(post._id, image.name)}
      alt=""
    >
      <Image
        src={postImageHref(post._id, image.name)}
        alt=""
        width={image.width}
        height={image.height}
        sizes={POST_IMAGE_SIZES}
        loading="eager"
        fetchPriority="high"
        className="h-auto w-full rounded-md"
      />
    </PostFullSizeImageLink>
  );
};

export default PostHeaderImage;
