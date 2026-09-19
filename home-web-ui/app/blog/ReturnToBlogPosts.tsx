import { blogHref } from "@/app/blog/links";
import Button from "@/app/ui/Button";

const ReturnToBlogPosts = ({ page = 1 }: { page?: number }) => (
  <Button
    type="link"
    linkProps={{ href: blogHref(page) }}
    size="large"
    emphasis="secondary"
  >
    Go Back
  </Button>
);

export default ReturnToBlogPosts;
