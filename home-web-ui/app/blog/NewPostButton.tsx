import { newPostHref } from "@/app/blog/links";
import AdminOnly from "@/app/components/AdminOnly";
import Button from "@/app/ui/Button";

const NewPostButton = ({ page }: { page: number }) => (
  <AdminOnly>
    <Button type="link" linkProps={{ href: newPostHref(page) }} size="small">
      New Post
    </Button>
  </AdminOnly>
);

export default NewPostButton;
