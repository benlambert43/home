"use client";

import { createPost } from "@/app/actions/posts";
import Button from "@/app/ui/Button";
import FieldError from "@/app/ui/FieldError";
import TextField from "@/app/ui/TextField";
import { useActionState } from "react";

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

      <div className="flex flex-col items-start justify-center gap-2">
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          rows={12}
          placeholder="Content"
          defaultValue={state?.values?.content}
          className="w-full max-w-160 rounded-xl px-4 py-2 outline-1
            outline-slate-400 focus:outline-slate-50"
        />
      </div>

      <FieldError errors={state?.properties?.content?.errors} />

      <div className="mt-4 flex flex-col items-start justify-center gap-2">
        <Button size="large" disabled={pending} type="submit">
          Create Post
        </Button>
      </div>
      <FieldError errors={state?.errors} />
    </form>
  );
};
export default NewPostForm;
