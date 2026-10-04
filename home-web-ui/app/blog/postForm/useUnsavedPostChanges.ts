import { POST_FORM_FIELDS } from "@/app/blog/postForm/postFormFields";
import {
  hasUnsavedImages,
  PostFormImages,
} from "@/app/blog/postForm/postFormImages";
import { readFormValues } from "@/app/lib/forms";
import { Post } from "@home/shared";
import { RefObject, useEffect } from "react";

export type SavedPostFields = Pick<Post, keyof typeof POST_FORM_FIELDS>;

export const EMPTY_POST_FIELDS: SavedPostFields = {
  title: "",
  content: "",
  headerImageAlt: null,
};

const hasUnsavedFields = (
  form: HTMLFormElement | null,
  saved: SavedPostFields,
) => {
  if (!form) return false;

  const current = readFormValues(new FormData(form), POST_FORM_FIELDS);

  return (
    current.title !== saved.title ||
    current.content !== saved.content ||
    current.headerImageAlt !== (saved.headerImageAlt ?? "")
  );
};

export const useUnsavedPostChanges = (
  formRef: RefObject<HTMLFormElement | null>,
  saved: SavedPostFields,
  images: PostFormImages,
) => {
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (
        hasUnsavedFields(formRef.current, saved) ||
        hasUnsavedImages(images)
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener("beforeunload", warn);

    return () => {
      window.removeEventListener("beforeunload", warn);
    };
  }, [formRef, saved, images]);
};
