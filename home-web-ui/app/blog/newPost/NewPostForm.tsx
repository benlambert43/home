"use client";

import { createPost } from "@/app/actions/posts";
import { discardPostUpload, startPostUpload } from "@/app/actions/postUploads";
import MarkdownEditor, {
  MarkdownEditorHandle,
  postImageMarkdown,
} from "@/app/blog/MarkdownEditor";
import PostImagePicker from "@/app/blog/newPost/PostImagePicker";
import {
  addPendingImages,
  PendingPostImage,
  unmatchedImageReferences,
} from "@/app/blog/newPost/pendingPostImages";
import {
  PostImageUploads,
  uploadPostImages,
  uploadSessionLost,
} from "@/app/blog/newPost/uploadPostImages";
import ReturnToBlogPosts from "@/app/blog/ReturnToBlogPosts";
import {
  CreatePostFormState,
  FieldNames,
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
  useEffect,
  useRef,
  useState,
} from "react";

const CREATE_POST_FIELDS = {
  title: "title",
  content: "content",
} as const satisfies FieldNames<typeof createPostFormSchema>;

const UPLOAD_ID_FIELD = "uploadId";

const UPLOAD_FAILED_MESSAGE =
  "Some images could not be uploaded. Please try again.";

const missingImagesMessage = (references: string[]) =>
  `The post links ${references.length === 1 ? "an image" : "images"} it does not have: ${references.join(", ")}`;

type PostUploadSession = {
  uploadId: string;
  names: string[];
  uploaded: string[];
};

const failedUploads = (uploads: PostImageUploads) =>
  Object.fromEntries(
    Object.entries(uploads).flatMap(([name, { response }]) =>
      response.error ? [[name, response.message]] : [],
    ),
  );

const uploadedNames = (uploads: PostImageUploads) =>
  Object.entries(uploads).flatMap(([name, { response }]) =>
    response.error ? [] : [name],
  );

const sameImages = (names: string[], other: string[]) =>
  names.length === other.length && names.every((name) => other.includes(name));

const discardSession = (session: PostUploadSession | undefined) => {
  if (session) void discardPostUpload(session.uploadId);
};

const uploadedProgress = (names: string[]) =>
  Object.fromEntries(names.map((name) => [name, 1]));

const NewPostForm = () => {
  const [state, action, pending] = useActionState(createPost, undefined);
  const [submitted, setSubmitted] = useState<CreatePostFormState>(undefined);
  const [images, setImages] = useState<PendingPostImage[]>([]);
  const [headerName, setHeaderName] = useState<string>();
  const [imageProblems, setImageProblems] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
  );
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const editorRef = useRef<MarkdownEditorHandle>(null);
  const sessionRef = useRef<PostUploadSession>(undefined);

  useEffect(
    () => () => {
      discardSession(sessionRef.current);
      sessionRef.current = undefined;
    },
    [],
  );

  const headerImage = images.find((image) => image.name === headerName);
  const inlineImages = images.filter((image) => image.name !== headerName);
  const errors = submitted ?? state;
  const busy = pending || uploading;

  const pickHeaderImage = async (files: File[]) => {
    const others = images.filter((image) => image.name !== headerName);
    const { images: added, problems } = await addPendingImages(others, files);

    setImageProblems(problems);

    if (added.length === others.length) return;

    if (headerImage) URL.revokeObjectURL(headerImage.previewUrl);

    setImages(added);
    setHeaderName(added[added.length - 1].name);
  };

  const addInlineImages = async (files: File[]) => {
    const { images: added, problems } = await addPendingImages(images, files);

    setImageProblems(problems);
    setImages(added);

    return added.slice(images.length).map((image) => image.name);
  };

  const insertImage = (image: PendingPostImage) => {
    editorRef.current?.insert(postImageMarkdown(image.name));
  };

  const removeImage = (name: string) => {
    setImages((current) => current.filter((image) => image.name !== name));
    if (name === headerName) setHeaderName(undefined);
  };

  const submitPost = async (formData: FormData) => {
    setSubmitted(undefined);
    setUploadErrors({});

    const values = readFormValues(formData, CREATE_POST_FIELDS);
    const validatedFields = createPostFormSchema.safeParse(values);

    if (!validatedFields.success) {
      setSubmitted({ values, ...treeifyFormError(validatedFields.error) });
      return;
    }

    const unmatched = unmatchedImageReferences(
      validatedFields.data.content,
      images.map((image) => image.name),
    );

    if (unmatched.length > 0) {
      setSubmitted({ values, errors: [missingImagesMessage(unmatched)] });
      return;
    }

    if (images.length === 0) {
      startTransition(() => {
        action(formData);
      });
      return;
    }

    setUploading(true);

    const names = images.map((image) => image.name);
    const resumed = sessionRef.current;
    let session =
      resumed && sameImages(resumed.names, names) ? resumed : undefined;

    if (!session) {
      discardSession(resumed);
      sessionRef.current = undefined;

      const started = await startPostUpload({
        headerImage: headerName,
        inlineImages: inlineImages.map((image) => image.name),
      });

      if (started.error) {
        setUploading(false);
        setSubmitted({ values, errors: [started.message] });
        return;
      }

      session = { uploadId: started.uploadId, names, uploaded: [] };
      sessionRef.current = session;
    }

    setUploadProgress(uploadedProgress(session.uploaded));

    const uploads = await uploadPostImages(
      session.uploadId,
      images.filter((image) => !session.uploaded.includes(image.name)),
      (name, progress) => {
        setUploadProgress((current) => ({ ...current, [name]: progress }));
      },
    );

    const failed = failedUploads(uploads);

    sessionRef.current = uploadSessionLost(uploads)
      ? undefined
      : {
          ...session,
          uploaded: [...session.uploaded, ...uploadedNames(uploads)],
        };

    setUploading(false);

    if (Object.keys(failed).length > 0) {
      setUploadErrors(failed);
      setSubmitted({ values, errors: [UPLOAD_FAILED_MESSAGE] });
      return;
    }

    formData.append(UPLOAD_ID_FIELD, session.uploadId);

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
        images={inlineImages}
        onAddImages={addInlineImages}
      />

      <FieldError errors={errors?.properties?.content?.errors} />

      <PostImagePicker
        headerImage={headerImage}
        inlineImages={inlineImages}
        problems={imageProblems}
        progress={uploadProgress}
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
