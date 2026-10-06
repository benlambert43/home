import Post, { PostParams } from "@/app/blog/Post";
import {
  postMetadata,
  siteShareImages,
  unavailableBlogMetadata,
} from "@/app/lib/metadata";
import { getPost } from "@/app/lib/posts";
import type { ResolvingMetadata } from "next";

type PostProps = { params: PostParams };

const PLACEHOLDER_SLUG = "__placeholder__";

export const instant = false;

export const generateStaticParams = () => [{ slug: PLACEHOLDER_SLUG }];

export const generateMetadata = async (
  { params }: PostProps,
  parent: ResolvingMetadata,
) => {
  const { slug } = await params;
  const result = await getPost(slug);

  if (result.error) return unavailableBlogMetadata;

  return postMetadata(result.post, await siteShareImages(parent));
};

const BlogPost = ({ params }: PostProps) => <Post params={params} />;

export default BlogPost;
