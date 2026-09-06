import { getBffSessionUser } from "@/app/auth/getBffSessionUser";
import { newPostHref } from "@/app/blog/links";
import Button from "@/app/ui/Button";

const NewPostButton = async () => {
  const user = await getBffSessionUser();

  if (user?.role !== "admin") return null;

  return (
    <Button type="link" linkProps={{ href: newPostHref }} size="small">
      New Post
    </Button>
  );
};

export default NewPostButton;
