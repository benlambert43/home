import AdjacentPosts from "@/app/blog/AdjacentPosts";
import {
  postFullSizeImageHref,
  postImageHref,
  requestedPage,
} from "@/app/blog/links";
import PostAdminActions from "@/app/blog/PostAdminActions";
import PostByline from "@/app/blog/PostByline";
import PostHeaderImage from "@/app/blog/PostHeaderImage";
import PostJsonLd from "@/app/blog/PostJsonLd";
import PostMarkdown from "@/app/blog/PostMarkdown";
import PostProblem from "@/app/blog/PostProblem";
import ReturnToBlogPosts from "@/app/blog/ReturnToBlogPosts";
import PageColumn from "@/app/components/PageColumn";
import { getPost } from "@/app/lib/posts";
import { SearchParams } from "@/app/lib/searchParams";
import { postHeadingIds } from "@home/shared";
import { Suspense } from "react";

export type PostParams = Promise<{ slug: string }>;

const Post = async ({
  params,
  searchParams,
}: {
  params: PostParams;
  searchParams: SearchParams;
}) => {
  const page = requestedPage((await searchParams).page);
  const result = await getPost((await params).slug);

  if (result.error) {
    return (
      <PostProblem
        headline="Post Unavailable"
        detail={result.message}
        page={page}
      />
    );
  }

  const { post, previous, next } = result;

  const postImages = post.headerImage
    ? [post.headerImage, ...post.inlineImages]
    : post.inlineImages;

  const images = postImages.map((image) => ({
    reference: image.reference,
    src: postImageHref(post.slug, image.name),
    fullSizeHref: postFullSizeImageHref(post.slug, image.name),
    width: image.width,
    height: image.height,
  }));

  return (
    <PageColumn className="flex flex-col gap-4">
      <PostJsonLd post={post} />
      <div className="flex flex-row items-center gap-2">
        <ReturnToBlogPosts
          page={page}
          postSlug={post.slug}
          appearance="arrow"
        />
        <Suspense fallback={null}>
          <PostAdminActions postId={post._id} slug={post.slug} page={page} />
        </Suspense>
      </div>
      <article className="flex flex-col gap-4">
        <header className="flex flex-col gap-4">
          <h1
            className="from-portrait-dusk via-portrait-haze to-portrait-sky
              w-fit bg-linear-to-r bg-clip-text text-5xl leading-tight
              font-medium text-transparent sm:text-6xl"
          >
            {post.title}
          </h1>
          <PostByline post={post} />
          <PostHeaderImage post={post} />
        </header>
        <PostMarkdown
          content={post.content}
          images={images}
          headingIds={postHeadingIds(post.content)}
        />
      </article>
      <AdjacentPosts previous={previous} next={next} page={page} />
      <div className="mt-6 flex justify-center">
        <ReturnToBlogPosts page={page} postSlug={post.slug} appearance="text" />
      </div>
    </PageColumn>
  );
};

export default Post;
