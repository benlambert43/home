import { postImageHref } from "@/app/blog/links";
import { POST_IMAGE_SIZES } from "@/app/blog/postImageSizes";
import { PostSummary } from "@home/shared";
import Image from "next/image";

const PostHeaderImage = ({ post }: { post: PostSummary }) => {
  const image = post.headerImage;

  if (!image) return null;

  return (
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
  );
};

export default PostHeaderImage;
