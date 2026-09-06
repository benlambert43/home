"use client";

import { blogHref, requestedPage } from "@/app/blog/links";
import Button from "@/app/ui/Button";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const ReturnButton = ({ page }: { page: number }) => (
  <Button
    type="link"
    linkProps={{ href: blogHref(page) }}
    size="large"
    emphasis="secondary"
  >
    Go Back
  </Button>
);

const RequestedPageButton = () => (
  <ReturnButton
    page={requestedPage(useSearchParams().get("page") ?? undefined)}
  />
);

const ReturnToBlogPosts = () => {
  return (
    <Suspense fallback={<ReturnButton page={1} />}>
      <RequestedPageButton />
    </Suspense>
  );
};

export default ReturnToBlogPosts;
