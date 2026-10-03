import Post, { PostParams } from "@/app/blog/Post";
import {
  postMetadata,
  siteShareImages,
  unavailableBlogMetadata,
} from "@/app/lib/metadata";
import { getPost } from "@/app/lib/posts";
import { SearchParams } from "@/app/lib/searchParams";
import type { ResolvingMetadata } from "next";

type PostProps = { params: PostParams; searchParams: SearchParams };

export const instant = false;

export const generateMetadata = async (
  { params }: PostProps,
  parent: ResolvingMetadata,
) => {
  const { id } = await params;
  const result = await getPost(id);

  if (result.error) return unavailableBlogMetadata;

  return postMetadata(result.post, await siteShareImages(parent));
};

const BlogPost = ({ params, searchParams }: PostProps) => (
  <Post params={params} searchParams={searchParams} />
);

export default BlogPost;
