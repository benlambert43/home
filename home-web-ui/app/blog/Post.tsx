import AdjacentPosts from "@/app/blog/AdjacentPosts";
import { postFullSizeImageHref, postImageHref } from "@/app/blog/links";
import PostAdminActions from "@/app/blog/PostAdminActions";
import PostArticle from "@/app/blog/PostArticle";
import { POST_COLUMN_WIDTH_CLASS_NAME } from "@/app/blog/postColumn";
import PostJsonLd from "@/app/blog/PostJsonLd";
import { PostMarkdownImage } from "@/app/blog/PostMarkdown";
import PostProblem from "@/app/blog/PostProblem";
import ReturnToBlogPosts from "@/app/blog/ReturnToBlogPosts";
import PageColumn from "@/app/components/PageColumn";
import { getPost } from "@/app/lib/posts";
import { PostImage } from "@home/shared";

export type PostParams = Promise<{ slug: string }>;

const postMarkdownImage = (
  slug: string,
  image: PostImage,
): PostMarkdownImage => ({
  reference: image.reference,
  src: postImageHref(slug, image.name),
  fullSizeHref: postFullSizeImageHref(slug, image.name),
  width: image.width,
  height: image.height,
});

const Post = async ({ params }: { params: PostParams }) => {
  const result = await getPost((await params).slug);

  if (result.error) {
    return <PostProblem headline="Post Unavailable" detail={result.message} />;
  }

  const { post, previous, next } = result;

  const headerImage = post.headerImage
    ? postMarkdownImage(post.slug, post.headerImage)
    : undefined;

  const inlineImages = post.inlineImages.map((image) =>
    postMarkdownImage(post.slug, image),
  );

  return (
    <PageColumn
      className="flex flex-col gap-4"
      widthClassName={POST_COLUMN_WIDTH_CLASS_NAME}
    >
      <PostJsonLd post={post} />
      <div className="flex flex-row items-center gap-2">
        <ReturnToBlogPosts postSlug={post.slug} appearance="arrow" />
        <PostAdminActions postId={post._id} slug={post.slug} />
      </div>
      <PostArticle
        post={post}
        headerImage={headerImage}
        images={headerImage ? [headerImage, ...inlineImages] : inlineImages}
      />
      <AdjacentPosts previous={previous} next={next} />
      <div className="mt-6 flex justify-center">
        <ReturnToBlogPosts postSlug={post.slug} appearance="text" />
      </div>
    </PageColumn>
  );
};

export default Post;
