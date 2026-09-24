import { FieldNames } from "@/app/lib/forms";
import { createPostFormSchema, updatePostFormSchema } from "@home/shared";

export const POST_FORM_FIELDS = {
  title: "title",
  content: "content",
} as const satisfies FieldNames<typeof createPostFormSchema> &
  FieldNames<typeof updatePostFormSchema>;

export const UPLOAD_ID_FIELD = "uploadId";

export const REVISION_FIELD = "revision";

export const REMOVE_HEADER_IMAGE_FIELD = "removeHeaderImage";

export const REMOVE_INLINE_IMAGES_FIELD = "removeInlineImages";
