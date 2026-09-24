"use client";

import MarkdownEditor, {
  MarkdownEditorHandle,
  postImageMarkdown,
} from "@/app/blog/MarkdownEditor";
import { postHref } from "@/app/blog/links";
import { POST_FORM_FIELDS } from "@/app/blog/postForm/postFormFields";
import PostImagePicker from "@/app/blog/postForm/PostImagePicker";
import {
  PostFormImage,
  postFormMarkdownImages,
  storedPostImages,
} from "@/app/blog/postForm/postFormImages";
import { usePostFormImages } from "@/app/blog/postForm/usePostFormImages";
import { usePostImageUpload } from "@/app/blog/postForm/usePostImageUpload";
import Button from "@/app/ui/Button";
import TextField from "@/app/ui/TextField";
import { Post } from "@home/shared";
import { useRef } from "react";

const EditPostForm = ({
  post,
  usedImageNames,
  page,
}: {
  post: Post;
  usedImageNames: string[];
  page: number;
}) => {
  const { images, problems, pickHeaderImage, addInlineImages, removeImage } =
    usePostFormImages(storedPostImages({ post, usedImageNames }));
  const { progress, errors: uploadErrors, uploading } = usePostImageUpload();
  const editorRef = useRef<MarkdownEditorHandle>(null);

  const insertImage = (image: PostFormImage) => {
    editorRef.current?.insert(postImageMarkdown(image.name));
  };

  return (
    <form className="flex flex-col gap-4">
      <TextField
        name={POST_FORM_FIELDS.title}
        label="Title"
        type="text"
        placeholder="Title"
        disabled={uploading}
        defaultValue={post.title}
      />

      <MarkdownEditor
        ref={editorRef}
        name={POST_FORM_FIELDS.content}
        label="Content"
        rows={12}
        disabled={uploading}
        defaultValue={post.content}
        images={postFormMarkdownImages(images)}
        onAddImages={addInlineImages}
      />

      <PostImagePicker
        images={images}
        problems={problems}
        progress={progress}
        errors={uploadErrors}
        disabled={uploading}
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
      </div>
    </form>
  );
};

export default EditPostForm;
