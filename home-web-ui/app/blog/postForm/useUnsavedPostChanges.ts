import { POST_FORM_FIELDS } from "@/app/blog/postForm/postFormFields";
import {
  hasUnsavedImages,
  PostFormImages,
} from "@/app/blog/postForm/postFormImages";
import { useNavigationGuard } from "@/app/components/NavigationGuardProvider";
import { Post } from "@home/shared";
import { RefObject, useEffect } from "react";

export type SavedPostFields = Pick<Post, keyof typeof POST_FORM_FIELDS>;

export const EMPTY_POST_FIELDS: SavedPostFields = {
  title: "",
  content: "",
  headerImageAlt: null,
};

const fieldValue = (form: HTMLFormElement, name: string) => {
  const field = form.elements.namedItem(name);

  return field instanceof HTMLInputElement ||
    field instanceof HTMLTextAreaElement
    ? field.value
    : "";
};

const hasUnsavedFields = (
  form: HTMLFormElement | null,
  saved: SavedPostFields,
) => {
  if (!form) return false;

  return (
    fieldValue(form, POST_FORM_FIELDS.title) !== saved.title ||
    fieldValue(form, POST_FORM_FIELDS.content) !== saved.content ||
    fieldValue(form, POST_FORM_FIELDS.headerImageAlt) !==
      (saved.headerImageAlt ?? "")
  );
};

export const useUnsavedPostChanges = (
  formRef: RefObject<HTMLFormElement | null>,
  saved: SavedPostFields,
  images: PostFormImages,
) => {
  const { blockWhile } = useNavigationGuard();

  useEffect(() => {
    const hasUnsavedChanges = () =>
      hasUnsavedFields(formRef.current, saved) || hasUnsavedImages(images);

    const warn = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) event.preventDefault();
    };

    const unblock = blockWhile(hasUnsavedChanges);
    window.addEventListener("beforeunload", warn);

    return () => {
      unblock();
      window.removeEventListener("beforeunload", warn);
    };
  }, [blockWhile, formRef, saved, images]);
};
