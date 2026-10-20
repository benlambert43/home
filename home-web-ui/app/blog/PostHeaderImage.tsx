import PostFullSizeImageLink from "@/app/blog/PostFullSizeImageLink";
import { postImageSizing } from "@/app/blog/postImageSizes";
import { PostImageSource } from "@/app/blog/PostMarkdown";
import Image from "next/image";

export type PostHeaderImageSource = PostImageSource & { alt: string };

const PostHeaderImage = ({ image }: { image: PostHeaderImageSource }) => {
  const rendered = (
    <Image
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      loading="eager"
      fetchPriority="high"
      {...postImageSizing(image)}
    />
  );

  if (image.fullSizeHref === undefined) return rendered;

  return (
    <PostFullSizeImageLink href={image.fullSizeHref} alt={image.alt}>
      {rendered}
    </PostFullSizeImageLink>
  );
};

export default PostHeaderImage;
