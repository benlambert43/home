import { POST_FORM_FIELDS } from "@/app/blog/postForm/postFormFields";
import {
  hasUnsavedImages,
  PostFormImages,
} from "@/app/blog/postForm/postFormImages";
import { readFormValues } from "@/app/lib/forms";
import { RefObject, useEffect } from "react";

export type SavedPostFields = Record<keyof typeof POST_FORM_FIELDS, string>;

export const EMPTY_POST_FIELDS: SavedPostFields = { title: "", content: "" };

const hasUnsavedFields = (
  form: HTMLFormElement | null,
  saved: SavedPostFields,
) => {
  if (!form) return false;

  const current = readFormValues(new FormData(form), POST_FORM_FIELDS);

  return current.title !== saved.title || current.content !== saved.content;
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
