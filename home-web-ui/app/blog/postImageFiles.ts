import { POST_IMAGE_CONTENT_TYPES } from "@home/shared";
import { ChangeEvent } from "react";

export const ACCEPTED_POST_IMAGE_TYPES = POST_IMAGE_CONTENT_TYPES.join(",");

export const pickedFiles = (event: ChangeEvent<HTMLInputElement>) => {
  const files = [...(event.target.files ?? [])];

  event.target.value = "";

  return files;
};
