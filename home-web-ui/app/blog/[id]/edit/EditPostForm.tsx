"use client";

import { updatePost } from "@/app/actions/posts";
import MarkdownEditor, {
  MarkdownEditorHandle,
  postImageMarkdown,
} from "@/app/blog/MarkdownEditor";
import { postHref } from "@/app/blog/links";
import {
  POST_FORM_FIELDS,
  REMOVE_HEADER_IMAGE_FIELD,
  REMOVE_INLINE_IMAGES_FIELD,
  REVISION_FIELD,
  UPLOAD_ID_FIELD,
} from "@/app/blog/postForm/postFormFields";
import PostImagePicker from "@/app/blog/postForm/PostImagePicker";
import {
  allPostFormImages,
  missingImagesMessage,
  pendingPostImages,
  PostFormImage,
  PostFormImages,
  postFormImageRemovals,
  postFormMarkdownImages,
  storedPostImages,
  unmatchedImageReferences,
} from "@/app/blog/postForm/postFormImages";
import { usePostFormImages } from "@/app/blog/postForm/usePostFormImages";
import { usePostImageUpload } from "@/app/blog/postForm/usePostImageUpload";
import {
  readFormValues,
  treeifyFormError,
  UpdatePostFormState,
} from "@/app/lib/forms";
import Button from "@/app/ui/Button";
import FieldError from "@/app/ui/FieldError";
import TextField from "@/app/ui/TextField";
import { Post, updatePostFormSchema } from "@home/shared";
import {
  startTransition,
  SubmitEvent,
  useActionState,
  useRef,
  useState,
} from "react";

const appendImageRemovals = (formData: FormData, images: PostFormImages) => {
  const { headerImage, removeInlineImages = [] } =
    postFormImageRemovals(images);

  if (headerImage === null) formData.append(REMOVE_HEADER_IMAGE_FIELD, "true");

  removeInlineImages.forEach((name) => {
    formData.append(REMOVE_INLINE_IMAGES_FIELD, name);
  });
};

const EditPostForm = ({
  post,
  usedImageNames,
  page,
}: {
  post: Post;
  usedImageNames: string[];
  page: number;
}) => {
  const [state, action, pending] = useActionState(
    updatePost.bind(null, post._id, page),
    undefined,
  );
  const [submitted, setSubmitted] = useState<UpdatePostFormState>(undefined);
  const { images, problems, pickHeaderImage, addInlineImages, removeImage } =
    usePostFormImages(storedPostImages({ post, usedImageNames }));
  const {
    upload,
    progress,
    errors: uploadErrors,
    uploading,
  } = usePostImageUpload();
  const editorRef = useRef<MarkdownEditorHandle>(null);

  const errors = submitted ?? state;
  const busy = pending || uploading;

  const insertImage = (image: PostFormImage) => {
    editorRef.current?.insert(postImageMarkdown(image.name));
  };

  const submitPost = async (formData: FormData) => {
    setSubmitted(undefined);

    const values = readFormValues(formData, POST_FORM_FIELDS);
    const validatedFields = updatePostFormSchema.safeParse(values);

    if (!validatedFields.success) {
      setSubmitted({ values, ...treeifyFormError(validatedFields.error) });
      return;
    }

    const unmatched = unmatchedImageReferences(
      validatedFields.data.content,
      images,
    );

    if (unmatched.length > 0) {
      setSubmitted({ values, errors: [missingImagesMessage(unmatched)] });
      return;
    }

    if (allPostFormImages(pendingPostImages(images)).length > 0) {
      const uploaded = await upload(images);

      if (!uploaded.ok) {
        setSubmitted({ values, errors: [uploaded.message] });
        return;
      }

      formData.append(UPLOAD_ID_FIELD, uploaded.uploadId);
    }

    formData.append(REVISION_FIELD, post.revision);
    appendImageRemovals(formData, images);

    startTransition(() => {
      action(formData);
    });
  };

  const onSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitPost(new FormData(event.currentTarget));
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <TextField
        name={POST_FORM_FIELDS.title}
        label="Title"
        type="text"
        placeholder="Title"
        disabled={busy}
        defaultValue={post.title}
      />

      <FieldError errors={errors?.properties?.title?.errors} />

      <MarkdownEditor
        ref={editorRef}
        name={POST_FORM_FIELDS.content}
        label="Content"
        rows={12}
        disabled={busy}
        defaultValue={post.content}
        images={postFormMarkdownImages(images)}
        onAddImages={addInlineImages}
      />

      <FieldError errors={errors?.properties?.content?.errors} />

      <PostImagePicker
        images={images}
        problems={problems}
        progress={progress}
        errors={uploadErrors}
        disabled={busy}
        onPickHeaderImage={pickHeaderImage}
        onAddInlineImages={addInlineImages}
        onInsertImage={insertImage}
        onRemoveImage={removeImage}
      />

      <div className="mt-4 flex flex-row items-start justify-start gap-2">
        <Button
          type="link"
          linkProps={{ href: postHref(post._id, page) }}
          size="large"
          emphasis="secondary"
        >
          Go Back
        </Button>
        <Button size="large" disabled={busy} type="submit">
          Save Post
        </Button>
      </div>
      <FieldError errors={errors?.errors} />
    </form>
  );
};

export default EditPostForm;
