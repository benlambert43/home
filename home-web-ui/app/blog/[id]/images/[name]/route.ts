import { proxyFullSizeInlineImage } from "@/app/lib/postImages";

type InlineImageParams = Promise<{ id: string; name: string }>;

export const GET = async (
  request: Request,
  { params }: { params: InlineImageParams },
) => proxyFullSizeInlineImage(request, await params);
