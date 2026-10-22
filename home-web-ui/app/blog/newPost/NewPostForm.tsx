"use client";

import { createPost } from "@/app/actions/posts";
import MarkdownEditor, {
  EDITOR_MODES,
  EditorMode,
  MarkdownEditorHandle,
  postImageMarkdown,
} from "@/app/blog/MarkdownEditor";
import {
  POST_FORM_FIELDS,
  UPLOAD_ID_FIELD,
} from "@/app/blog/postForm/postFormFields";
import PostImagePicker from "@/app/blog/postForm/PostImagePicker";
import PostPreview, {
  PostPreviewFields,
  readPostPreviewFields,
} from "@/app/blog/postForm/PostPreview";
import {
  allPostFormImages,
  missingImagesMessage,
  pendingPostImages,
  PostFormImage,
  unmatchedImageReferences,
} from "@/app/blog/postForm/postFormImages";
import { usePostFormImages } from "@/app/blog/postForm/usePostFormImages";
import { usePostImageUpload } from "@/app/blog/postForm/usePostImageUpload";
import ReturnToBlogPosts from "@/app/blog/ReturnToBlogPosts";
import {
  CreatePostFormState,
  readFormValues,
  treeifyFormError,
} from "@/app/lib/forms";
import Button from "@/app/ui/Button";
import FieldError from "@/app/ui/FieldError";
import SegmentedToggle from "@/app/ui/SegmentedToggle";
import TextField from "@/app/ui/TextField";
import { createPostFormSchema } from "@home/shared";
import {
  startTransition,
  SubmitEvent,
  useActionState,
  useRef,
  useState,
} from "react";

const NewPostForm = ({ authorUsername }: { authorUsername: string }) => {
  const [state, action, pending] = useActionState(createPost, undefined);
  const [submitted, setSubmitted] = useState<CreatePostFormState>(undefined);
  const [preview, setPreview] = useState<PostPreviewFields>();
  const { images, problems, pickHeaderImage, addInlineImages, removeImage } =
    usePostFormImages();
  const {
    upload,
    progress,
    errors: uploadErrors,
    uploading,
  } = usePostImageUpload();
  const editorRef = useRef<MarkdownEditorHandle>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const errors = submitted ?? state;
  const busy = pending || uploading;

  const changeEditorMode = (mode: EditorMode) => {
    setPreview(
      mode === "preview" && formRef.current
        ? readPostPreviewFields(formRef.current)
        : undefined,
    );
  };

  const insertImage = (image: PostFormImage) => {
    editorRef.current?.insert(postImageMarkdown(image.name));
  };

  const submitPost = async (formData: FormData) => {
    setSubmitted(undefined);

    const values = readFormValues(formData, POST_FORM_FIELDS);
    const validatedFields = createPostFormSchema.safeParse(values);

    if (!validatedFields.success) {
      setPreview(undefined);
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
      setPreview(undefined);
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
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-4">
      <SegmentedToggle
        label="Editor mode"
        options={EDITOR_MODES}
        value={preview ? "preview" : "write"}
        onChange={changeEditorMode}
      />

      <div className={`${preview ? "hidden" : "flex"} flex-col gap-4`}>
        <TextField
          name={POST_FORM_FIELDS.title}
          label="Title"
          width="full"
          type="text"
          placeholder="Title"
          disabled={busy}
          defaultValue={state?.values?.title}
        />

        <FieldError errors={errors?.properties?.title?.errors} />

        <MarkdownEditor
          ref={editorRef}
          name={POST_FORM_FIELDS.content}
          label="Content"
          rows={12}
          disabled={busy}
          defaultValue={state?.values?.content}
          onAddImages={addInlineImages}
        />

        <FieldError errors={errors?.properties?.content?.errors} />

        <PostImagePicker
          images={images}
          headerImageAltErrors={errors?.properties?.headerImageAlt?.errors}
          problems={problems}
          progress={progress}
          errors={uploadErrors}
          disabled={busy}
          onPickHeaderImage={pickHeaderImage}
          onAddInlineImages={addInlineImages}
          onInsertImage={insertImage}
          onRemoveImage={removeImage}
        />
      </div>

      {preview && (
        <PostPreview
          fields={preview}
          images={images}
          authorUsername={authorUsername}
        />
      )}

      <div className="mt-4 flex flex-row items-start justify-start gap-2">
        <ReturnToBlogPosts appearance="outlined" />
        <Button size="large" disabled={busy} type="submit">
          Create Post
        </Button>
      </div>
      <FieldError errors={errors?.errors} />
    </form>
  );
};

export default NewPostForm;
