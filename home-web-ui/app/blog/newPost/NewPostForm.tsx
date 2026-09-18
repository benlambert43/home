"use client";

import { createPost } from "@/app/actions/posts";
import MarkdownEditor, {
  MarkdownEditorHandle,
  postImageMarkdown,
} from "@/app/blog/MarkdownEditor";
import {
  CREATE_POST_FIELDS,
  UPLOAD_ID_FIELD,
} from "@/app/blog/newPost/createPostFields";
import PostImagePicker from "@/app/blog/newPost/PostImagePicker";
import {
  allPendingImages,
  PendingPostImage,
  pendingMarkdownImages,
  unmatchedImageReferences,
} from "@/app/blog/newPost/pendingPostImages";
import { usePendingPostImages } from "@/app/blog/newPost/usePendingPostImages";
import { usePostImageUpload } from "@/app/blog/newPost/usePostImageUpload";
import ReturnToBlogPosts from "@/app/blog/ReturnToBlogPosts";
import {
  CreatePostFormState,
  readFormValues,
  treeifyFormError,
} from "@/app/lib/forms";
import Button from "@/app/ui/Button";
import FieldError from "@/app/ui/FieldError";
import TextField from "@/app/ui/TextField";
import { createPostFormSchema } from "@home/shared";
import {
  startTransition,
  SubmitEvent,
  useActionState,
  useRef,
  useState,
} from "react";

const missingImagesMessage = (references: string[]) =>
  `The post links ${references.length === 1 ? "an image" : "images"} it does not have: ${references.join(", ")}`;

const NewPostForm = () => {
  const [state, action, pending] = useActionState(createPost, undefined);
  const [submitted, setSubmitted] = useState<CreatePostFormState>(undefined);
  const { images, problems, pickHeaderImage, addInlineImages, removeImage } =
    usePendingPostImages();
  const {
    upload,
    progress,
    errors: uploadErrors,
    uploading,
  } = usePostImageUpload();
  const editorRef = useRef<MarkdownEditorHandle>(null);

  const errors = submitted ?? state;
  const busy = pending || uploading;

  const insertImage = (image: PendingPostImage) => {
    editorRef.current?.insert(postImageMarkdown(image.name));
  };

  const submitPost = async (formData: FormData) => {
    setSubmitted(undefined);

    const values = readFormValues(formData, CREATE_POST_FIELDS);
    const validatedFields = createPostFormSchema.safeParse(values);

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

    if (allPendingImages(images).length > 0) {
      const uploaded = await upload(images);

      if (!uploaded.ok) {
        setSubmitted({ values, errors: [uploaded.message] });
        return;
      }

      formData.append(UPLOAD_ID_FIELD, uploaded.uploadId);
    }

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
        name={CREATE_POST_FIELDS.title}
        label="Title"
        type="text"
        placeholder="Title"
        disabled={busy}
        defaultValue={state?.values?.title}
      />

      <FieldError errors={errors?.properties?.title?.errors} />

      <MarkdownEditor
        ref={editorRef}
        name={CREATE_POST_FIELDS.content}
        label="Content"
        rows={12}
        disabled={busy}
        defaultValue={state?.values?.content}
        images={pendingMarkdownImages(images)}
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
        <ReturnToBlogPosts />
        <Button size="large" disabled={busy} type="submit">
          Create Post
        </Button>
      </div>
      <FieldError errors={errors?.errors} />
    </form>
  );
};

export default NewPostForm;
