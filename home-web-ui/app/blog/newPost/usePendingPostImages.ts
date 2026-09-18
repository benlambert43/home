import {
  allPendingImages,
  NO_PENDING_IMAGES,
  PendingPostImage,
  PendingPostImages,
  readImageFiles,
  releasePendingImage,
  withHeaderImage,
  withInlineImages,
  withoutPendingImage,
} from "@/app/blog/newPost/pendingPostImages";
import { useEffect, useRef, useState } from "react";

export const usePendingPostImages = () => {
  const [images, setImages] = useState(NO_PENDING_IMAGES);
  const [problems, setProblems] = useState<string[]>([]);
  const latestImages = useRef(images);

  const update = (next: PendingPostImages) => {
    latestImages.current = next;
    setImages(next);
  };

  useEffect(
    () => () => {
      allPendingImages(latestImages.current).forEach(releasePendingImage);
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

    if (replaced) releasePendingImage(replaced);
  };

  const addInlineImages = async (files: File[]) => {
    const { read, problems: unreadable } = await readImageFiles(files);
    const {
      pending,
      added,
      problems: refused,
    } = withInlineImages(latestImages.current, read);

    setProblems([...unreadable, ...refused]);
    update(pending);

    return added.map((image) => image.name);
  };

  const removeImage = (image: PendingPostImage) => {
    update(withoutPendingImage(latestImages.current, image));
    releasePendingImage(image);
  };

  return { images, problems, pickHeaderImage, addInlineImages, removeImage };
};
