import PostFullSizeImageLink from "@/app/blog/PostFullSizeImageLink";
import { PostMarkdownImage } from "@/app/blog/PostMarkdown";
import { postImageSizing } from "@/app/blog/postImageSizes";
import Image from "next/image";

const PostHeaderImage = ({
  image,
  alt,
}: {
  image?: PostMarkdownImage;
  alt: string;
}) => {
  if (!image) return null;

  const rendered = (
    <Image
      src={image.src}
      alt={alt}
      width={image.width}
      height={image.height}
      loading="eager"
      fetchPriority="high"
      {...postImageSizing(image)}
    />
  );

  if (image.fullSizeHref === undefined) return rendered;

  return (
    <PostFullSizeImageLink href={image.fullSizeHref} alt={alt}>
      {rendered}
    </PostFullSizeImageLink>
  );
};

export default PostHeaderImage;
