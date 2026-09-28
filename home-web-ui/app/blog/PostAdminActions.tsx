import { getBffSessionUser } from "@/app/auth/getBffSessionUser";
import DeletePostButton from "@/app/blog/DeletePostButton";
import { editPostHref } from "@/app/blog/links";
import Button from "@/app/ui/Button";

const PostAdminActions = async ({
  postId,
  page,
}: {
  postId: string;
  page: number;
}) => {
  const user = await getBffSessionUser();

  if (user?.role !== "admin") return null;

  return (
    <>
      <Button
        type="link"
        linkProps={{ href: editPostHref(postId, page) }}
        size="small"
      >
        Edit
      </Button>
      <DeletePostButton postId={postId} page={page} />
    </>
  );
};

export default PostAdminActions;
