"use client";

import { updatePost } from "@/app/actions/posts";
import { postHref } from "@/app/blog/links";
import {
  POST_FORM_FIELDS,
  REMOVE_HEADER_IMAGE_FIELD,
  REMOVE_INLINE_IMAGES_FIELD,
  REVISION_FIELD,
  UPLOAD_ID_FIELD,
} from "@/app/blog/postForm/postFormFields";
import PostFormViews, { PostFormView } from "@/app/blog/postForm/PostFormViews";
import PostImagePicker from "@/app/blog/postForm/PostImagePicker";
import {
  allPostFormImages,
  missingImagesMessage,
  pendingPostImages,
  PostFormImage,
  PostFormImages,
  postFormImageRemovals,
  storedPostImages,
  unmatchedImageReferences,
} from "@/app/blog/postForm/postFormImages";
import PostPreview from "@/app/blog/postForm/PostPreview";
import { usePostFormImages } from "@/app/blog/postForm/usePostFormImages";
import { usePostImageUpload } from "@/app/blog/postForm/usePostImageUpload";
import { useUnsavedPostChanges } from "@/app/blog/postForm/useUnsavedPostChanges";
import AquariusEditor, {
  AquariusEditorHandle,
} from "@/app/blog/aquariusEditor/AquariusEditor";
import {
  readFormValues,
  treeifyFormError,
  UpdatePostFormState,
} from "@/app/lib/forms";
import Button from "@/app/ui/Button";
import FieldError from "@/app/ui/FieldError";
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
  const [view, setView] = useState<PostFormView>("editor");
  const { images, problems, pickHeaderImage, addInlineImages, removeImage } =
    usePostFormImages(storedPostImages({ post, usedImageNames }));
  const {
    upload,
    progress,
    errors: uploadErrors,
    uploading,
  } = usePostImageUpload();
  const editorRef = useRef<AquariusEditorHandle>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useUnsavedPostChanges(formRef, post, images);

  const errors = submitted ?? state;
  const busy = pending || uploading;

  const insertImage = (image: PostFormImage) => {
    editorRef.current?.insertImage(image.name);
  };

  const reject = (failure: UpdatePostFormState) => {
    setSubmitted(failure);
    setView("editor");
  };

  const submitPost = async (formData: FormData) => {
    setSubmitted(undefined);

    const values = readFormValues(formData, POST_FORM_FIELDS);
    const validatedFields = updatePostFormSchema.safeParse(values);

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
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-4">
      <PostFormViews
        view={view}
        onViewChange={setView}
        formRef={formRef}
        renderPreview={(snapshot) => (
          <PostPreview
            snapshot={snapshot}
            authorUsername={post.authorUsername}
            createdDate={post.createdDate}
            images={images}
          />
        )}
        actions={
          <>
            <div className="mt-4 flex flex-row items-start justify-start gap-2">
              <Button
                type="link"
                linkProps={{ href: postHref(post.slug, page) }}
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
          </>
        }
      >
        <AquariusEditor
          ref={editorRef}
          titleName={POST_FORM_FIELDS.title}
          contentName={POST_FORM_FIELDS.content}
          defaultTitle={post.title}
          defaultContent={post.content}
          images={allPostFormImages(images)}
          disabled={busy}
          onAddImages={addInlineImages}
        />

        <FieldError errors={errors?.properties?.title?.errors} />
        <FieldError errors={errors?.properties?.content?.errors} />

        <PostImagePicker
          images={images}
          headerImageAlt={post.headerImageAlt}
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

export default EditPostForm;
