"use client";

import { createPost } from "@/app/actions/posts";
import Button from "@/app/ui/Button";
import FieldError from "@/app/ui/FieldError";
import TextArea from "@/app/ui/TextArea";
import TextField from "@/app/ui/TextField";
import { useActionState } from "react";
import ReturnToBlogPosts from "@/app/blog/ReturnToBlogPosts";

const NewPostForm = () => {
  const [state, action, pending] = useActionState(createPost, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <TextField
        name="title"
        label="Title"
        type="text"
        placeholder="Title"
        defaultValue={state?.values?.title}
      />

      <FieldError errors={state?.properties?.title?.errors} />

      <TextArea
        name="content"
        label="Content"
        rows={12}
        placeholder="Content"
        defaultValue={state?.values?.content}
      />

      <FieldError errors={state?.properties?.content?.errors} />

      <div className="mt-4 flex flex-row items-start justify-start gap-2">
        <ReturnToBlogPosts />
        <Button size="large" disabled={pending} type="submit">
          Create Post
        </Button>
      </div>
      <FieldError errors={state?.errors} />
    </form>
  );
};

export default NewPostForm;
