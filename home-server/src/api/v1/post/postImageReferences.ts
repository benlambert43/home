import { postImageReference, postMarkdownProblems } from "@home/shared";
import { StoredPostFile } from "../types/db";

export const postImageProblems = (content: string, images: StoredPostFile[]) =>
  postMarkdownProblems(
    content,
    images.map((image) => postImageReference(image.name)),
  );
