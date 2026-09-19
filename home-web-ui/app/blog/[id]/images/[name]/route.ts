import { proxyPostImage } from "@/app/lib/postImages";

type ImageParams = Promise<{ id: string; name: string }>;

export const GET = async (
  request: Request,
  { params }: { params: ImageParams },
) => proxyPostImage(request, await params);
