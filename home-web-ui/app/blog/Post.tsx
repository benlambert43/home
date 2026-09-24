import EditPostButton from "@/app/blog/EditPostButton";
import {
  postFullSizeImageHref,
  postImageHref,
  requestedPage,
} from "@/app/blog/links";
import PostByline from "@/app/blog/PostByline";
import PostHeaderImage from "@/app/blog/PostHeaderImage";
import PostMarkdown from "@/app/blog/PostMarkdown";
import PostProblem from "@/app/blog/PostProblem";
import ReturnToBlogPosts from "@/app/blog/ReturnToBlogPosts";
import { getPost } from "@/app/lib/posts";
import { SearchParams } from "@/app/lib/searchParams";
import { Suspense } from "react";

export type PostParams = Promise<{ id: string }>;

const Post = async ({
  params,
  searchParams,
}: {
  params: PostParams;
  searchParams: SearchParams;
}) => {
  const page = requestedPage((await searchParams).page);
  const result = await getPost((await params).id);

  if (result.error) {
    return (
      <PostProblem
        headline="Post Unavailable"
        detail={result.message}
        page={page}
      />
    );
  }

  const { post } = result;

  const postImages = post.headerImage
    ? [post.headerImage, ...post.inlineImages]
    : post.inlineImages;

  const images = postImages.map((image) => ({
    reference: image.reference,
    src: postImageHref(post._id, image.name),
    fullSizeHref: postFullSizeImageHref(post._id, image.name),
    width: image.width,
    height: image.height,
  }));

  return (
    <div className="flex max-w-160 flex-col gap-4 p-5">
      <div className="flex flex-row items-center gap-2">
        <ReturnToBlogPosts page={page} postId={post._id} appearance="arrow" />
        <Suspense fallback={null}>
          <EditPostButton postId={post._id} page={page} />
        </Suspense>
      </div>
      <h1
        className="from-portrait-dusk via-portrait-haze to-portrait-sky w-fit
          bg-linear-to-r bg-clip-text text-5xl leading-tight font-medium
          text-transparent sm:text-6xl"
      >
        {post.title}
      </h1>
      <PostByline post={post} />
      <PostHeaderImage post={post} />
      <PostMarkdown content={post.content} images={images} />
      <div>
        <ReturnToBlogPosts page={page} postId={post._id} />
      </div>
    </div>
  );
};

export default Post;
