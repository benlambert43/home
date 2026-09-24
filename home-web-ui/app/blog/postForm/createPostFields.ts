import { FieldNames } from "@/app/lib/forms";
import { createPostFormSchema } from "@home/shared";

export const CREATE_POST_FIELDS = {
  title: "title",
  content: "content",
} as const satisfies FieldNames<typeof createPostFormSchema>;

export const UPLOAD_ID_FIELD = "uploadId";
