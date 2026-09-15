import { open } from "node:fs/promises";
import { PostImageContentType } from "@home/shared";

interface PostImageType {
  contentType: PostImageContentType;
}

const EXTENSION_CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
};

const SIGNATURE_BYTES = 16;

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
    type: { contentType: "image/png" },
    matches: (data) => signedAt(data, 0, PNG_SIGNATURE),
  },
  {
    type: { contentType: "image/jpeg" },
    matches: (data) => signedAt(data, 0, JPEG_SIGNATURE),
  },
  {
    type: { contentType: "image/gif" },
    matches: (data) =>
      signedAt(data, 0, "GIF87a") || signedAt(data, 0, "GIF89a"),
  },
  {
    type: { contentType: "image/webp" },
    matches: (data) => signedAt(data, 0, "RIFF") && signedAt(data, 8, "WEBP"),
  },
  {
    type: { contentType: "image/avif" },
    matches: (data) =>
      signedAt(data, 4, "ftyp") &&
      (signedAt(data, 8, "avif") || signedAt(data, 8, "avis")),
  },
];

export const detectImageType = (data: Buffer): PostImageType | undefined =>
  IMAGE_TYPES.find(({ matches }) => matches(data))?.type;

export const detectFileImageType = async (
  file: string,
): Promise<PostImageType | undefined> => {
  const handle = await open(file);

  try {
    const { buffer, bytesRead } = await handle.read(
      Buffer.alloc(SIGNATURE_BYTES),
      0,
      SIGNATURE_BYTES,
      0,
    );

    return detectImageType(buffer.subarray(0, bytesRead));
  } finally {
    await handle.close();
  }
};

export const contentTypeForName = (name: string): string | undefined =>
  EXTENSION_CONTENT_TYPES[name.slice(name.lastIndexOf(".") + 1).toLowerCase()];
