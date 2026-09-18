import { postImageHref, postThumbnailHref } from "@/app/blog/links";
import PostByline from "@/app/blog/PostByline";
import PostHeaderImage from "@/app/blog/PostHeaderImage";
import PostMarkdown from "@/app/blog/PostMarkdown";
import PostProblem from "@/app/blog/PostProblem";
import ReturnToBlogPosts from "@/app/blog/ReturnToBlogPosts";
import { getPost } from "@/app/lib/posts";

export type PostParams = Promise<{ id: string }>;

const Post = async ({ params }: { params: PostParams }) => {
  const result = await getPost((await params).id);

  if (result.error) {
    return <PostProblem headline="Post Unavailable" detail={result.message} />;
  }

  const { post } = result;

  const postImages = post.headerImage
    ? [post.headerImage, ...post.inlineImages]
    : post.inlineImages;

  const images = postImages.map((image) => ({
    reference: image.reference,
    src: postThumbnailHref(post._id, image.name, "large"),
    href: postImageHref(post._id, image.name),
    width: image.width,
    height: image.height,
  }));

  return (
    <div className="flex max-w-160 flex-col gap-4 p-5">
      <h1
        className="from-portrait-dusk via-portrait-haze to-portrait-sky w-fit
          bg-linear-to-r bg-clip-text text-5xl font-medium text-transparent
          sm:text-6xl"
      >
        {post.title}
      </h1>
      <PostByline post={post} />
      <PostHeaderImage post={post} />
      <PostMarkdown content={post.content} images={images} />
      <div>
        <ReturnToBlogPosts />
      </div>
    </div>
  );
};

export default Post;
