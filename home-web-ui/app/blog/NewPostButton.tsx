import { getBffSessionUser } from "@/app/auth/getBffSessionUser";
import Button from "@/app/ui/Button";

const NewPost = async () => {
  const user = await getBffSessionUser();

  if (user?.role !== "admin") return null;

  return (
    <div>
      <Button type="link" linkProps={{ href: "/blog/newPost" }} size="small">
        New Post
      </Button>
    </div>
  );
};

export default NewPost;
