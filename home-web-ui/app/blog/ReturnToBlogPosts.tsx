import { blogHref } from "@/app/blog/links";
import Button from "@/app/ui/Button";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";

const ReturnToBlogPosts = ({
  page = 1,
  postId,
  appearance = "filled",
}: {
  page?: number;
  postId?: string;
  appearance?: "filled" | "outlined" | "arrow";
}) => {
  const linkProps = { href: blogHref(page, postId) };

  if (appearance === "arrow") {
    return (
      <Button type="link" linkProps={linkProps} size="small" title="Go Back">
        <ArrowLeftIcon className="my-1 block size-4" />
      </Button>
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
