"use client";

import BlogListPage from "@/app/blog/BlogListPage";
import DeletePostButton from "@/app/blog/DeletePostButton";
import { editPostHref } from "@/app/blog/links";
import AdminOnly from "@/app/components/AdminOnly";
import Button from "@/app/ui/Button";

const PostAdminActions = ({
  postId,
  slug,
}: {
  postId: string;
  slug: string;
}) => (
  <AdminOnly>
    <BlogListPage>
      {(page) => (
        <>
          <Button
            type="link"
            linkProps={{ href: editPostHref(slug, page) }}
            size="small"
          >
            Edit
          </Button>
          <DeletePostButton postId={postId} page={page} />
        </>
      )}
    </BlogListPage>
  </AdminOnly>
);

export default PostAdminActions;
