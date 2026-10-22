import PostByline, { PostBylineDetails } from "@/app/blog/PostByline";
import PostHeaderImage from "@/app/blog/PostHeaderImage";
import PostMarkdown, { PostMarkdownImage } from "@/app/blog/PostMarkdown";
import { postHeadingIds } from "@home/shared";

export type PostArticleDetails = PostBylineDetails & {
  title: string;
  content: string;
  headerImageAlt: string | null;
};

const PostArticle = ({
  post,
  headerImage,
  images,
  preview = false,
}: {
  post: PostArticleDetails;
  headerImage?: PostMarkdownImage;
  images: PostMarkdownImage[];
  preview?: boolean;
}) => {
  const Title = preview ? "div" : "h1";

  return (
    <article className="flex flex-col gap-4">
      <header className="flex flex-col gap-4">
        <Title
          className="from-portrait-dusk via-portrait-haze to-portrait-sky w-fit
            bg-linear-to-r bg-clip-text text-5xl leading-tight font-medium
            text-transparent sm:text-6xl"
        >
          {post.title}
        </Title>
        <PostByline post={post} />
        <PostHeaderImage image={headerImage} alt={post.headerImageAlt ?? ""} />
      </header>
      <PostMarkdown
        content={post.content}
        images={images}
        headingIds={postHeadingIds(post.content)}
      />
    </article>
  );
};

export default PostArticle;
