"use client";

import BlogListPage from "@/app/blog/BlogListPage";
import { blogHref } from "@/app/blog/links";
import Button from "@/app/ui/Button";
import SubtleLink from "@/app/ui/SubtleLink";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";

type Appearance = "filled" | "outlined" | "arrow" | "text";

const ReturnLink = ({
  href,
  appearance,
}: {
  href: string;
  appearance: Appearance;
}) => {
  const linkProps = { href };

  if (appearance === "arrow") {
    return (
      <Button type="link" linkProps={linkProps} size="small" title="Go Back">
        <ArrowLeftIcon className="my-1 block size-4" />
      </Button>
    );
  }

  if (appearance === "text") {
    return (
      <SubtleLink href={href} textSize="base">
        Go Back
      </SubtleLink>
    );
  }

  return (
    <Button
      type="link"
      linkProps={linkProps}
      size="large"
      emphasis={appearance === "filled" ? "primary" : "secondary"}
    >
      Go Back
    </Button>
  );
};

const ReturnToBlogPosts = ({
  postSlug,
  appearance = "filled",
}: {
  postSlug?: string;
  appearance?: Appearance;
}) => (
  <BlogListPage>
    {(page) => (
      <ReturnLink href={blogHref(page, postSlug)} appearance={appearance} />
    )}
  </BlogListPage>
);

export default ReturnToBlogPosts;
