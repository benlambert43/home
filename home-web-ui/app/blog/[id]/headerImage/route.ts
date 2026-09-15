import { proxyFullSizeHeaderImage } from "@/app/lib/postImages";

type HeaderImageParams = Promise<{ id: string }>;

export const GET = async (
  request: Request,
  { params }: { params: HeaderImageParams },
) => proxyFullSizeHeaderImage(request, await params);
