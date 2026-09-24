import { getBffSessionUser } from "@/app/auth/getBffSessionUser";
import { editPostHref } from "@/app/blog/links";
import Button from "@/app/ui/Button";

const EditPostButton = async ({
  postId,
  page,
}: {
  postId: string;
  page: number;
}) => {
  const user = await getBffSessionUser();

  if (user?.role !== "admin") return null;

  return (
    <Button
      type="link"
      linkProps={{ href: editPostHref(postId, page) }}
      size="small"
    >
      Edit
    </Button>
  );
};

export default EditPostButton;
