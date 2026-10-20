"use client";

import PostArticle from "@/app/blog/PostArticle";
import {
  allPostFormImages,
  PostFormImage,
  PostFormImages,
} from "@/app/blog/postForm/postFormImages";
import { PostFormSnapshot } from "@/app/blog/postForm/PostFormViews";
import { normalizePostContent, postImageReference } from "@home/shared";

const normalizedLine = (text: string) => text.normalize("NFC").trim();

const imageSource = ({ src, fullSizeHref, width, height }: PostFormImage) => ({
  src,
  fullSizeHref,
  width,
  height,
});

const PostPreview = ({
  snapshot,
  authorUsername,
  createdDate = snapshot.at,
  images,
}: {
  snapshot: PostFormSnapshot;
  authorUsername: string | null;
  createdDate?: string;
  images: PostFormImages;
}) => (
  <PostArticle
    title={normalizedLine(snapshot.title)}
    byline={{ authorUsername, createdDate, modifiedDate: snapshot.at }}
    headerImage={
      images.headerImage
        ? {
            ...imageSource(images.headerImage),
            alt: normalizedLine(snapshot.headerImageAlt),
          }
        : null
    }
    content={normalizePostContent(snapshot.content)}
    images={allPostFormImages(images).map((image) => ({
      reference: postImageReference(image.name),
      ...imageSource(image),
    }))}
  />
);

export default PostPreview;
