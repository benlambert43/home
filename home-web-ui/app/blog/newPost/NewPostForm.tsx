"use client";

import { createPost } from "@/app/actions/posts";
import {
  POST_FORM_FIELDS,
  UPLOAD_ID_FIELD,
} from "@/app/blog/postForm/postFormFields";
import PostFormViews, { PostFormView } from "@/app/blog/postForm/PostFormViews";
import PostImagePicker from "@/app/blog/postForm/PostImagePicker";
import {
  allPostFormImages,
  missingImagesMessage,
  pendingPostImages,
  PostFormImage,
  unmatchedImageReferences,
} from "@/app/blog/postForm/postFormImages";
import PostPreview from "@/app/blog/postForm/PostPreview";
import { usePostFormImages } from "@/app/blog/postForm/usePostFormImages";
import { usePostImageUpload } from "@/app/blog/postForm/usePostImageUpload";
import {
  EMPTY_POST_FIELDS,
  useUnsavedPostChanges,
} from "@/app/blog/postForm/useUnsavedPostChanges";
import ReturnToBlogPosts from "@/app/blog/ReturnToBlogPosts";
import AquariusEditor, {
  AquariusEditorHandle,
} from "@/app/blog/aquariusEditor/AquariusEditor";
import {
  CreatePostFormState,
  readFormValues,
  treeifyFormError,
} from "@/app/lib/forms";
import Button from "@/app/ui/Button";
import FieldError from "@/app/ui/FieldError";
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
  const [view, setView] = useState<PostFormView>("editor");
  const { images, problems, pickHeaderImage, addInlineImages, removeImage } =
    usePostFormImages();
  const {
    upload,
    progress,
    errors: uploadErrors,
    uploading,
  } = usePostImageUpload();
  const editorRef = useRef<AquariusEditorHandle>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useUnsavedPostChanges(formRef, EMPTY_POST_FIELDS, images);

  const errors = submitted ?? state;
  const busy = pending || uploading;

  const insertImage = (image: PostFormImage) => {
    editorRef.current?.insertImage(image.name);
  };

  const reject = (failure: CreatePostFormState) => {
    setSubmitted(failure);
    setView("editor");
  };

  const submitPost = async (formData: FormData) => {
    setSubmitted(undefined);

    const values = readFormValues(formData, POST_FORM_FIELDS);
    const validatedFields = createPostFormSchema.safeParse(values);

    if (!validatedFields.success) {
      reject({ values, ...treeifyFormError(validatedFields.error) });
      return;
    }

    const unmatched = unmatchedImageReferences(
      validatedFields.data.content,
      images,
    );

    if (unmatched.length > 0) {
      reject({ values, errors: [missingImagesMessage(unmatched)] });
      return;
    }

    if (allPostFormImages(pendingPostImages(images)).length > 0) {
      const uploaded = await upload(images);

      if (!uploaded.ok) {
        reject({ values, errors: [uploaded.message] });
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
      <PostFormViews
        view={view}
        onViewChange={setView}
        formRef={formRef}
        renderPreview={(snapshot) => (
          <PostPreview
            snapshot={snapshot}
            authorUsername={authorUsername}
            images={images}
          />
        )}
        actions={
          <>
            <div className="mt-4 flex flex-row items-start justify-start gap-2">
              <ReturnToBlogPosts appearance="outlined" />
              <Button size="large" disabled={busy} type="submit">
                Create Post
              </Button>
            </div>
            <FieldError errors={errors?.errors} />
          </>
        }
      >
        <AquariusEditor
          ref={editorRef}
          titleName={POST_FORM_FIELDS.title}
          contentName={POST_FORM_FIELDS.content}
          defaultTitle={state?.values?.title}
          defaultContent={state?.values?.content}
          images={allPostFormImages(images)}
          disabled={busy}
          onAddImages={addInlineImages}
        />

        <FieldError errors={errors?.properties?.title?.errors} />
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
      </PostFormViews>
    </form>
  );
};

export default NewPostForm;
