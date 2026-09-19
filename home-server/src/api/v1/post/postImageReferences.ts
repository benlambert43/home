import { postImageReference, postImageReferences } from "@home/shared";
import { StoredPostFile } from "../types/db";

export const unmatchedImageReference = (
  content: string,
  images: StoredPostFile[],
) => {
  const references = new Set(
    images.map((image) => postImageReference(image.name)),
  );

  return postImageReferences(content).find(
    (reference) => !references.has(reference),
  );
};
