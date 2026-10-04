import { blogHref } from "@/app/blog/links";
import Button from "@/app/ui/Button";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";
import Link from "next/link";

const ReturnToBlogPosts = ({
  page = 1,
  postSlug,
  appearance = "filled",
}: {
  page?: number;
  postSlug?: string;
  appearance?: "filled" | "outlined" | "arrow" | "text";
}) => {
  const linkProps = { href: blogHref(page, postSlug) };

  if (appearance === "arrow") {
    return (
      <Button type="link" linkProps={linkProps} size="small" title="Go Back">
        <ArrowLeftIcon className="my-1 block size-4" />
      </Button>
    );
  }

  if (appearance === "text") {
    return (
      <Link
        href={linkProps.href}
        className="text-sm text-slate-400 hover:text-slate-200 hover:underline"
      >
        Go Back
      </Link>
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

export default ReturnToBlogPosts;
