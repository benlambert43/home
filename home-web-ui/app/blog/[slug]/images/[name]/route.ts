import { proxyPostImage } from "@/app/lib/postImages";

type ImageParams = Promise<{ slug: string; name: string }>;

export const GET = async (
  _request: Request,
  { params }: { params: ImageParams },
) => proxyPostImage(await params);
