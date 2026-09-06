"use client";

import { blogHref, requestedPage } from "@/app/blog/links";
import Button from "@/app/ui/Button";
import { useSearchParams } from "next/navigation";

export const ReturnToBlogPostsButton = ({ href }: { href: string }) => (
  <Button type="link" linkProps={{ href }} size="small">
    Return to Blog Posts
  </Button>
);

const ReturnToBlogPosts = () => {
  const page = requestedPage(useSearchParams().get("page") ?? undefined);

  return <ReturnToBlogPostsButton href={blogHref(page)} />;
};

export default ReturnToBlogPosts;
