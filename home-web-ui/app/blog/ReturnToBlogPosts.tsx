import { blogHref } from "@/app/blog/links";
import Button from "@/app/ui/Button";

const ReturnToBlogPosts = () => (
  <Button
    type="link"
    linkProps={{ href: blogHref(1) }}
    size="large"
    emphasis="secondary"
  >
    Go Back
  </Button>
);

export default ReturnToBlogPosts;
