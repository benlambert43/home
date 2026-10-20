import PostByline, { PostBylineFields } from "@/app/blog/PostByline";
import PostHeaderImage, {
  PostHeaderImageSource,
} from "@/app/blog/PostHeaderImage";
import { PostImageColumn } from "@/app/blog/postImageSizes";
import PostMarkdown, { PostMarkdownImage } from "@/app/blog/PostMarkdown";
import { postHeadingIds } from "@home/shared";

const PostArticle = ({
  title,
  byline,
  headerImage,
  content,
  images,
  columns,
}: {
  title: string;
  byline: PostBylineFields;
  headerImage: PostHeaderImageSource | null;
  content: string;
  images: PostMarkdownImage[];
  columns?: PostImageColumn[];
}) => (
  <article className="flex flex-col gap-4">
    <header className="flex flex-col gap-4">
      <h1
        className="from-portrait-dusk via-portrait-haze to-portrait-sky w-fit
          bg-linear-to-r bg-clip-text text-5xl leading-tight font-medium
          text-transparent sm:text-6xl"
      >
        {title}
      </h1>
      <PostByline post={byline} />
      {headerImage && <PostHeaderImage image={headerImage} columns={columns} />}
    </header>
    <PostMarkdown
      content={content}
      images={images}
      headingIds={postHeadingIds(content)}
      columns={columns}
    />
  </article>
);

export default PostArticle;
