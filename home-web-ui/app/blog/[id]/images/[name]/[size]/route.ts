import { proxyThumbnail } from "@/app/lib/postImages";

type ThumbnailParams = Promise<{ id: string; name: string; size: string }>;

export const GET = async (
  request: Request,
  { params }: { params: ThumbnailParams },
) => proxyThumbnail(request, await params);
