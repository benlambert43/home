import PostArticle, { PostArticleDetails } from "@/app/blog/PostArticle";
import { POST_FORM_FIELDS } from "@/app/blog/postForm/postFormFields";
import {
  postFormMarkdownImage,
  postFormMarkdownImages,
  PostFormImages,
} from "@/app/blog/postForm/postFormImages";
import { fieldValue } from "@/app/blog/postForm/useUnsavedPostChanges";
import { createPostFormSchema, normalizePostContent } from "@home/shared";

export type PostPreviewFields = Pick<
  PostArticleDetails,
  "title" | "content" | "headerImageAlt"
> & { previewedDate: string };

const { title: titleField, headerImageAlt: headerImageAltField } =
  createPostFormSchema.shape;

export const readPostPreviewFields = (
  form: HTMLFormElement,
): PostPreviewFields => {
  const title = fieldValue(form, POST_FORM_FIELDS.title);
  const headerImageAlt = fieldValue(form, POST_FORM_FIELDS.headerImageAlt);
  const parsedTitle = titleField.safeParse(title);
  const parsedHeaderImageAlt = headerImageAltField.safeParse(headerImageAlt);

  return {
    title: parsedTitle.success ? parsedTitle.data : title,
    content: normalizePostContent(fieldValue(form, POST_FORM_FIELDS.content)),
    headerImageAlt:
      (parsedHeaderImageAlt.success ? parsedHeaderImageAlt.data : undefined) ??
      headerImageAlt,
    previewedDate: new Date().toISOString(),
  };
};

const PostPreview = ({
  fields: { previewedDate, ...fields },
  images,
  authorUsername,
  createdDate = previewedDate,
}: {
  fields: PostPreviewFields;
  images: PostFormImages;
  authorUsername: string | null;
  createdDate?: string;
}) => (
  <PostArticle
    post={{
      ...fields,
      authorUsername,
      createdDate,
      modifiedDate: previewedDate,
    }}
    headerImage={
      images.headerImage && postFormMarkdownImage(images.headerImage)
    }
    images={postFormMarkdownImages(images)}
  />
);

export default PostPreview;
