import {
  allPostFormImages,
  NO_POST_FORM_IMAGES,
  PostFormImage,
  PostFormImages,
  readImageFiles,
  releasePostFormImage,
  withHeaderImage,
  withInlineImages,
  withoutImage,
} from "@/app/blog/postForm/postFormImages";
import { useEffect, useRef, useState } from "react";

export const usePostFormImages = (initialImages = NO_POST_FORM_IMAGES) => {
  const [images, setImages] = useState(initialImages);
  const [problems, setProblems] = useState<string[]>([]);
  const latestImages = useRef(images);

  const update = (next: PostFormImages) => {
    latestImages.current = next;
    setImages(next);
  };

  useEffect(
    () => () => {
      allPostFormImages(latestImages.current).forEach(releasePostFormImage);
    },
    [],
  );

  const pickHeaderImage = async (files: File[]) => {
    const { read, problems: unreadable } = await readImageFiles(
      files.slice(0, 1),
    );

    setProblems(unreadable);

    if (read.length === 0) return;

    const replaced = latestImages.current.headerImage;

    update(withHeaderImage(latestImages.current, read[0]));

    if (replaced) releasePostFormImage(replaced);
  };

  const addInlineImages = async (files: File[]) => {
    const { read, problems: unreadable } = await readImageFiles(files);
    const {
      images: next,
      added,
      problems: refused,
    } = withInlineImages(latestImages.current, read);

    setProblems([...unreadable, ...refused]);
    update(next);

    return added.map((image) => image.name);
  };

  const removeImage = (image: PostFormImage) => {
    update(withoutImage(latestImages.current, image));
    releasePostFormImage(image);
  };

  return { images, problems, pickHeaderImage, addInlineImages, removeImage };
};
