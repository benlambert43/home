import {
  blogMetadata,
  siteShareImages,
  unavailableBlogMetadata,
} from "@/app/lib/metadata";
import { getCachedPosts } from "@/app/lib/posts";
import type { Metadata, ResolvingMetadata } from "next";

export const blogPageMetadata = async (
  page: number,
  parent: ResolvingMetadata,
): Promise<Metadata> => {
  const result = await getCachedPosts(page);

  if (result.error || page > result.pagination.totalPages) {
    return unavailableBlogMetadata;
  }

  return blogMetadata(page, await siteShareImages(parent));
};
