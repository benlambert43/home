import { uploadPostImage } from "@/app/lib/postImageUploads";

type UploadImageParams = Promise<{ uploadId: string; name: string }>;

export const PUT = async (
  request: Request,
  { params }: { params: UploadImageParams },
) => uploadPostImage(request, await params);
