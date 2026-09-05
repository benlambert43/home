import Button from "@/app/ui/Button";

const NewPost = () => (
  <div>
    <Button type="link" linkProps={{ href: "/blog/newPost" }} size="small">
      New Post
    </Button>
  </div>
);

export default NewPost;
