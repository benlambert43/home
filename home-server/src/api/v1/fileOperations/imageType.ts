import { FileHandle, open } from "node:fs/promises";
import { PostImageContentType } from "@home/shared";

interface PostImageType {
  contentType: PostImageContentType;
}

const SIGNATURE_BYTES = 16;

const PNG_SIGNATURE = "\x89PNG\r\n\x1a\n";

const JPEG_SIGNATURE = "\xff\xd8\xff";

const PNG_CHUNK_HEADER_BYTES = 8;

const PNG_CHUNK_CRC_BYTES = 4;

const MAX_PNG_CHUNKS_BEFORE_IMAGE_DATA = 1024;

const AVIF_SEQUENCE_BRAND = "avis";

const FILE_TYPE_MAJOR_BRAND_OFFSET = 8;

const FILE_TYPE_COMPATIBLE_BRANDS_OFFSET = 16;

const FILE_TYPE_BRAND_BYTES = 4;

const MAX_FILE_TYPE_BOX_BYTES = 4096;

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

const readAt = async (handle: FileHandle, bytes: number, position: number) => {
  const { buffer, bytesRead } = await handle.read(
    Buffer.alloc(bytes),
    0,
    bytes,
    position,
  );

  return buffer.subarray(0, bytesRead);
};

const hasPngAnimationControl = async (handle: FileHandle) => {
  let position = PNG_SIGNATURE.length;

  for (let chunk = 0; chunk < MAX_PNG_CHUNKS_BEFORE_IMAGE_DATA; chunk++) {
    const header = await readAt(handle, PNG_CHUNK_HEADER_BYTES, position);
    if (header.byteLength < PNG_CHUNK_HEADER_BYTES) return false;

    const type = header.toString("latin1", 4, 8);
    if (type === "acTL") return true;
    if (type === "IDAT") return false;

    position +=
      PNG_CHUNK_HEADER_BYTES + header.readUInt32BE(0) + PNG_CHUNK_CRC_BYTES;
  }

  return true;
};

const fileTypeBrandOffsets = (boxBytes: number) => {
  const offsets = [FILE_TYPE_MAJOR_BRAND_OFFSET];

  for (
    let offset = FILE_TYPE_COMPATIBLE_BRANDS_OFFSET;
    offset + FILE_TYPE_BRAND_BYTES <= boxBytes;
    offset += FILE_TYPE_BRAND_BYTES
  ) {
    offsets.push(offset);
  }

  return offsets;
};

const hasAvifSequenceBrand = async (handle: FileHandle) => {
  const fileType = await readAt(handle, MAX_FILE_TYPE_BOX_BYTES, 0);
  const boxBytes = Math.min(fileType.readUInt32BE(0), fileType.byteLength);

  return fileTypeBrandOffsets(boxBytes).some((offset) =>
    signedAt(fileType, offset, AVIF_SEQUENCE_BRAND),
  );
};

export const isAnimatedPngOrAvifSequence = async (file: string) => {
  const handle = await open(file);

  try {
    const signature = await readAt(handle, SIGNATURE_BYTES, 0);
    if (signedAt(signature, 4, "ftyp")) {
      return await hasAvifSequenceBrand(handle);
    }

    return (
      signedAt(signature, 0, PNG_SIGNATURE) &&
      (await hasPngAnimationControl(handle))
    );
  } finally {
    await handle.close();
  }
};
