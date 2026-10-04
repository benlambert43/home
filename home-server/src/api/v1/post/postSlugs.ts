import { postSlug, RESERVED_POST_SLUGS } from "@home/shared";
import { PostModel } from "../model/postModel";
import { RetiredPostSlugModel } from "../model/retiredPostSlugModel";

const slugTaken = async (slug: string) =>
  RESERVED_POST_SLUGS.includes(slug) ||
  (await PostModel.exists({ slug })) !== null ||
  (await RetiredPostSlugModel.exists({ slug })) !== null;

export const uniquePostSlug = async (title: string) => {
  let attempt = 1;
  while (await slugTaken(postSlug(title, attempt))) attempt += 1;

  return postSlug(title, attempt);
};

export const retirePostSlug = async (slug: string) => {
  await RetiredPostSlugModel.updateOne(
    { slug },
    { $setOnInsert: { retiredDate: new Date() } },
    { upsert: true },
  );
};
