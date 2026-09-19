import { getBffSessionUser } from "@/app/auth/getBffSessionUser";
import { newPostHref, requestedPage } from "@/app/blog/links";
import { SearchParams } from "@/app/lib/searchParams";
import Button from "@/app/ui/Button";

const NewPostButton = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}) => {
  const user = await getBffSessionUser();

  if (user?.role !== "admin") return null;

  const page = requestedPage((await searchParams).page);

  return (
    <Button type="link" linkProps={{ href: newPostHref(page) }} size="small">
      New Post
    </Button>
  );
};

export default NewPostButton;
