import { PostImageContentType } from "@home/shared";

interface PostImageType {
  contentType: PostImageContentType;
  extension: string;
}

const PNG_SIGNATURE = "\x89PNG\r\n\x1a\n";

const JPEG_SIGNATURE = "\xff\xd8\xff";

const signedAt = (data: Buffer, offset: number, signature: string) =>
  data.subarray(offset, offset + signature.length).toString("latin1") ===
  signature;

const IMAGE_TYPES: {
  type: PostImageType;
  matches: (data: Buffer) => boolean;
}[] = [
  {
    type: { contentType: "image/png", extension: "png" },
    matches: (data) => signedAt(data, 0, PNG_SIGNATURE),
  },
  {
    type: { contentType: "image/jpeg", extension: "jpg" },
    matches: (data) => signedAt(data, 0, JPEG_SIGNATURE),
  },
  {
    type: { contentType: "image/gif", extension: "gif" },
    matches: (data) =>
      signedAt(data, 0, "GIF87a") || signedAt(data, 0, "GIF89a"),
  },
  {
    type: { contentType: "image/webp", extension: "webp" },
    matches: (data) => signedAt(data, 0, "RIFF") && signedAt(data, 8, "WEBP"),
  },
  {
    type: { contentType: "image/avif", extension: "avif" },
    matches: (data) =>
      signedAt(data, 4, "ftyp") &&
      (signedAt(data, 8, "avif") || signedAt(data, 8, "avis")),
  },
];

export const detectImageType = (data: Buffer): PostImageType | undefined =>
  IMAGE_TYPES.find(({ matches }) => matches(data))?.type;
