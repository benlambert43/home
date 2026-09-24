"use client";

import {
  PostFormImage,
  PostFormImages,
} from "@/app/blog/postForm/postFormImages";
import {
  ACCEPTED_POST_IMAGE_TYPES,
  pickedFiles,
} from "@/app/blog/postImageFiles";
import Button from "@/app/ui/Button";
import FieldError from "@/app/ui/FieldError";
import { FIELD_WIDTHS } from "@/app/ui/fieldStyles";
import { PhotoIcon } from "@heroicons/react/16/solid";
import Image from "next/image";
import { ReactNode, useRef } from "react";

const THUMBNAIL_PIXELS = 64;

const KILOBYTE = 1000;

const MEGABYTE = 1000 * KILOBYTE;

const HEADER_IMAGE_INPUT = "headerImage";

const INLINE_IMAGES_INPUT = "inlineImages";

const fileSize = (bytes: number) =>
  bytes >= MEGABYTE
    ? `${(bytes / MEGABYTE).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / KILOBYTE))} KB`;

const PostImageField = ({
  input,
  label,
  action,
  multiple = false,
  disabled,
  onPick,
  children,
}: {
  input: string;
  label: string;
  action: string;
  multiple?: boolean;
  disabled: boolean;
  onPick: (files: File[]) => void;
  children?: ReactNode;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={FIELD_WIDTHS.wide.wrapper}>
      <label htmlFor={input}>{label}</label>

      <Button
        type="button"
        size="small"
        emphasis="secondary"
        disabled={disabled}
        title={label}
        onClick={() => {
          inputRef.current?.click();
        }}
      >
        <span className="flex flex-row items-center gap-1">
          <PhotoIcon className="size-4" />
          {action}
        </span>
      </Button>

      <input
        id={input}
        ref={inputRef}
        type="file"
        hidden
        multiple={multiple}
        accept={ACCEPTED_POST_IMAGE_TYPES}
        disabled={disabled}
        onChange={(event) => {
          onPick(pickedFiles(event));
        }}
      />

      {children}
    </div>
  );
};

const PostImageRow = ({
  image,
  progress,
  error,
  disabled,
  onInsert,
  onRemove,
}: {
  image: PostFormImage;
  progress?: number;
  error?: string;
  disabled: boolean;
  onInsert?: (image: PostFormImage) => void;
  onRemove: (image: PostFormImage) => void;
}) => (
  <li className="flex flex-row items-center gap-3">
    <Image
      src={image.src}
      alt=""
      width={THUMBNAIL_PIXELS}
      height={THUMBNAIL_PIXELS}
      className="size-16 rounded-md object-cover"
    />

    <div className="flex min-w-0 flex-col">
      <span className="truncate font-mono">{image.name}</span>
      <span className="text-sm text-slate-400">
        {fileSize(image.byteSize)}
        {progress === undefined || error !== undefined
          ? ""
          : ` · ${Math.round(progress * 100)}%`}
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
  images: { headerImage, inlineImages },
  problems,
  progress,
  errors,
  disabled,
  onPickHeaderImage,
  onAddInlineImages,
  onInsertImage,
  onRemoveImage,
}: {
  images: PostFormImages;
  problems: string[];
  progress: Record<string, number>;
  errors: Record<string, string>;
  disabled: boolean;
  onPickHeaderImage: (files: File[]) => Promise<void>;
  onAddInlineImages: (files: File[]) => Promise<string[]>;
  onInsertImage: (image: PostFormImage) => void;
  onRemoveImage: (image: PostFormImage) => void;
}) => {
  const row = (image: PostFormImage, onInsert?: typeof onInsertImage) => (
    <PostImageRow
      key={image.name}
      image={image}
      progress={progress[image.name]}
      error={errors[image.name]}
      disabled={disabled}
      onInsert={onInsert}
      onRemove={onRemoveImage}
    />
  );

  return (
    <div className="flex flex-col gap-4">
      <PostImageField
        input={HEADER_IMAGE_INPUT}
        label="Header image"
        action={headerImage ? "Replace image" : "Choose image"}
        disabled={disabled}
        onPick={(files) => {
          void onPickHeaderImage(files);
        }}
      >
        {headerImage && <ul className="flex flex-col">{row(headerImage)}</ul>}
      </PostImageField>

      <PostImageField
        input={INLINE_IMAGES_INPUT}
        label="Images"
        action="Add images"
        multiple
        disabled={disabled}
        onPick={(files) => {
          void onAddInlineImages(files);
        }}
      >
        {inlineImages.length > 0 && (
          <ul className="flex flex-col gap-2">
            {inlineImages.map((image) => row(image, onInsertImage))}
          </ul>
        )}
      </PostImageField>

      <FieldError errors={problems} />
    </div>
  );
};

export default PostImagePicker;
