import { postThumbnailHref } from "@/app/blog/links";
import { PostSummary } from "@home/shared";
import Image from "next/image";

const PostHeaderImage = ({ post }: { post: PostSummary }) => {
  const image = post.headerImage;

  if (!image) return null;

  return (
    <Image
      src={postThumbnailHref(post._id, image.name, "large")}
      alt=""
      width={image.width}
      height={image.height}
      unoptimized
      preload
      fetchPriority="high"
      className="h-auto w-full rounded-md"
    />
  );
};

export default PostHeaderImage;
