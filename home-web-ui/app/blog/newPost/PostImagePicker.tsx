"use client";

import { PendingPostImage } from "@/app/blog/newPost/pendingPostImages";
import Button from "@/app/ui/Button";
import FieldError from "@/app/ui/FieldError";
import { FIELD_CLASSES, FIELD_WIDTHS } from "@/app/ui/fieldStyles";
import { POST_IMAGE_CONTENT_TYPES } from "@home/shared";
import Image from "next/image";
import { ChangeEvent, useEffect, useRef } from "react";

const ACCEPTED_TYPES = POST_IMAGE_CONTENT_TYPES.join(",");

const THUMBNAIL_PIXELS = 64;

const KILOBYTE = 1024;

const MEGABYTE = 1024 * KILOBYTE;

const HEADER_IMAGE_INPUT = "headerImage";

const INLINE_IMAGES_INPUT = "inlineImages";

const fileSize = (bytes: number) =>
  bytes >= MEGABYTE
    ? `${(bytes / MEGABYTE).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / KILOBYTE))} KB`;

const pickedFiles = (event: ChangeEvent<HTMLInputElement>) => {
  const files = [...(event.target.files ?? [])];

  event.target.value = "";

  return files;
};

const PostImageRow = ({
  image,
  progress,
  error,
  disabled,
  onInsert,
  onRemove,
}: {
  image: PendingPostImage;
  progress?: number;
  error?: string;
  disabled: boolean;
  onInsert?: (image: PendingPostImage) => void;
  onRemove: (image: PendingPostImage) => void;
}) => (
  <li className="flex flex-row items-center gap-3">
    <Image
      src={image.previewUrl}
      alt=""
      width={THUMBNAIL_PIXELS}
      height={THUMBNAIL_PIXELS}
      unoptimized
      className="size-16 rounded-md object-cover"
    />

    <div className="flex min-w-0 flex-col">
      <span className="truncate font-mono">{image.name}</span>
      <span className="text-sm text-slate-400">
        {fileSize(image.file.size)}
        {progress === undefined ? "" : ` · ${Math.round(progress * 100)}%`}
      </span>
      {error !== undefined && <span className="text-sm">{error}</span>}
    </div>

    <div className="ml-auto flex flex-row gap-2">
      {onInsert && (
        <Button
          type="button"
          size="small"
          emphasis="secondary"
          disabled={disabled}
          onClick={() => {
            onInsert(image);
          }}
        >
          Insert
        </Button>
      )}

      <Button
        type="button"
        size="small"
        emphasis="secondary"
        color="danger"
        disabled={disabled}
        onClick={() => {
          onRemove(image);
        }}
      >
        Remove
      </Button>
    </div>
  </li>
);

const PostImagePicker = ({
  headerImage,
  inlineImages,
  problems,
  progress,
  errors,
  disabled,
  onPickHeaderImage,
  onAddInlineImages,
  onInsertImage,
  onRemoveImage,
}: {
  headerImage?: PendingPostImage;
  inlineImages: PendingPostImage[];
  problems: string[];
  progress: Record<string, number>;
  errors: Record<string, string>;
  disabled: boolean;
  onPickHeaderImage: (files: File[]) => Promise<void>;
  onAddInlineImages: (files: File[]) => Promise<string[]>;
  onInsertImage: (image: PendingPostImage) => void;
  onRemoveImage: (name: string) => void;
}) => {
  const shown = headerImage ? [headerImage, ...inlineImages] : inlineImages;
  const shownRef = useRef(shown);

  useEffect(() => {
    shownRef.current = shown;
  });

  useEffect(
    () => () => {
      shownRef.current.forEach((image) => {
        URL.revokeObjectURL(image.previewUrl);
      });
    },
    [],
  );

  const removeImage = (image: PendingPostImage) => {
    URL.revokeObjectURL(image.previewUrl);
    onRemoveImage(image.name);
  };

  const row = (image: PendingPostImage, onInsert?: typeof onInsertImage) => (
    <PostImageRow
      key={image.name}
      image={image}
      progress={progress[image.name]}
      error={errors[image.name]}
      disabled={disabled}
      onInsert={onInsert}
      onRemove={removeImage}
    />
  );

  return (
    <div className="flex flex-col gap-4">
      <div className={FIELD_WIDTHS.wide.wrapper}>
        <label htmlFor={HEADER_IMAGE_INPUT}>Header image</label>
        <input
          id={HEADER_IMAGE_INPUT}
          type="file"
          accept={ACCEPTED_TYPES}
          disabled={disabled}
          className={`${FIELD_WIDTHS.wide.field} ${FIELD_CLASSES}
            hover:cursor-pointer`}
          onChange={(event) => {
            void onPickHeaderImage(pickedFiles(event));
          }}
        />
        {headerImage && <ul className="flex flex-col">{row(headerImage)}</ul>}
      </div>

      <div className={FIELD_WIDTHS.wide.wrapper}>
        <label htmlFor={INLINE_IMAGES_INPUT}>Images</label>
        <input
          id={INLINE_IMAGES_INPUT}
          type="file"
          multiple
          accept={ACCEPTED_TYPES}
          disabled={disabled}
          className={`${FIELD_WIDTHS.wide.field} ${FIELD_CLASSES}
            hover:cursor-pointer`}
          onChange={(event) => {
            void onAddInlineImages(pickedFiles(event));
          }}
        />
        {inlineImages.length > 0 && (
          <ul className="flex flex-col gap-2">
            {inlineImages.map((image) => row(image, onInsertImage))}
          </ul>
        )}
      </div>

      <FieldError errors={problems} />
    </div>
  );
};

export default PostImagePicker;
