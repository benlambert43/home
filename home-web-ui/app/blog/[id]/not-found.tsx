import Button from "@/app/ui/Button";

const PostNotFound = () => (
  <div className="flex flex-col gap-4 p-5">
    <div className="text-4xl font-bold">Post Not Found</div>
    <div>That post could not be found.</div>
    <div>
      <Button type="link" linkProps={{ href: "/blog" }} size="small">
        Back to Blog
      </Button>
    </div>
  </div>
);

export default PostNotFound;
