import AdjacentPosts from "@/app/blog/AdjacentPosts";
import { postFullSizeImageHref, postImageHref } from "@/app/blog/links";
import PostAdminActions from "@/app/blog/PostAdminActions";
import PostArticle from "@/app/blog/PostArticle";
import PostJsonLd from "@/app/blog/PostJsonLd";
import { POST_PAGE_IMAGE_COLUMNS } from "@/app/blog/postImageSizes";
import PostProblem from "@/app/blog/PostProblem";
import ReturnToBlogPosts from "@/app/blog/ReturnToBlogPosts";
import PageColumn from "@/app/components/PageColumn";
import { getPost } from "@/app/lib/posts";
import { PostImage } from "@home/shared";

export type PostParams = Promise<{ slug: string }>;

const postImageSource = (slug: string, image: PostImage) => ({
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

  const postImages = post.headerImage
    ? [post.headerImage, ...post.inlineImages]
    : post.inlineImages;

  return (
    <PageColumn
      className="flex flex-col gap-4"
      widthClassName="lg:w-3/4 2xl:w-1/2 3xl:w-1/3"
    >
      <PostJsonLd post={post} />
      <div className="flex flex-row items-center gap-2">
        <ReturnToBlogPosts postSlug={post.slug} appearance="arrow" />
        <PostAdminActions postId={post._id} slug={post.slug} />
      </div>
      <PostArticle
        columns={POST_PAGE_IMAGE_COLUMNS}
        title={post.title}
        byline={post}
        headerImage={
          post.headerImage && {
            ...postImageSource(post.slug, post.headerImage),
            alt: post.headerImageAlt ?? "",
          }
        }
        content={post.content}
        images={postImages.map((image) => ({
          reference: image.reference,
          ...postImageSource(post.slug, image),
        }))}
      />
      <AdjacentPosts previous={previous} next={next} />
      <div className="mt-6 flex justify-center">
        <ReturnToBlogPosts postSlug={post.slug} appearance="text" />
      </div>
    </PageColumn>
  );
};

export default Post;
