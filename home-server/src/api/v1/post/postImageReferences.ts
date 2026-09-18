import { Marked, MarkedToken } from "marked";
import { POST_IMAGE_REFERENCE_PREFIX, postImageReference } from "@home/shared";
import { StoredPostFile } from "../types/db";

const markdown = new Marked();

const linkedUrls = (content: string) => {
  const urls: string[] = [];

  void markdown.walkTokens(markdown.lexer(content), (token) => {
    const known = token as MarkedToken;

    if (known.type === "image" || known.type === "link") urls.push(known.href);
  });

  return urls;
};

export const unmatchedImageReference = (
  content: string,
  images: StoredPostFile[],
) => {
  const references = new Set(
    images.map((image) => postImageReference(image.name)),
  );

  return linkedUrls(content).find(
    (url) =>
      url.startsWith(POST_IMAGE_REFERENCE_PREFIX) && !references.has(url),
  );
};
