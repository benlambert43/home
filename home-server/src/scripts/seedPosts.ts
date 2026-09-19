import { writeFile } from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";
import {
  ApiResponse,
  createPostBodySchema,
  Post,
  updatePostBodySchema,
  UserNoPassword,
} from "@home/shared";
import { incomingPostUploadPath } from "../api/v1/fileOperations/uploadStorage";
import { PostModel } from "../api/v1/model/postModel";
import { UserModel } from "../api/v1/model/userModel";
import { handleCreatePost } from "../api/v1/post/handlers/handleCreatePost";
import { handleCreatePostUpload } from "../api/v1/post/handlers/handleCreatePostUpload";
import { handleUpdatePost } from "../api/v1/post/handlers/handleUpdatePost";
import { handleUploadPostImage } from "../api/v1/post/handlers/handleUploadPostImage";
import { PostWrite, queuePostThumbnails } from "../api/v1/post/postThumbnails";
import {
  discardPostUpload,
  discardPostUploadOnFailure,
} from "../api/v1/post/postUploads";
import { serializeUser } from "../api/v1/types/serialize";
import {
  seededTitle,
  SeedPost,
  seedPostCatalogue,
  SeedPostEdit,
} from "./seed/seedPostCatalogue";
import { renderSeedImage, SeedImage } from "./seed/seedPostImages";

const DEFAULT_POST_COUNT = 30;

const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;

const HOURS_BETWEEN_POSTS = 53;

const HOURS_BETWEEN_REVISIONS = 12;

type PostResponse = ApiResponse<{ post: Post }>;

const requireEnv = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not defined.`);
  }
  return value;
};

const requestedPostCount = () => {
  const [argument] = process.argv.slice(2);
  if (argument === undefined) return DEFAULT_POST_COUNT;

  const count = Number(argument);
  if (!Number.isInteger(count) || count < 1) {
    throw new Error(`Expected a whole number of posts, got "${argument}".`);
  }
  return count;
};

const findAuthor = async (): Promise<UserNoPassword> => {
  const email = requireEnv("ADMIN_EMAIL");
  const author = await UserModel.findOne({ email });

  if (!author) {
    throw new Error(
      `No account with the email ${email}, create the admin account before seeding.`,
    );
  }

  return serializeUser(author);
};

const findSeededTitles = async (titles: string[]) => {
  const posts = await PostModel.find({ title: { $in: titles } }).select(
    "title",
  );

  return new Set(posts.map((post) => post.title));
};

const uploadImage = async (uploadId: string, image: SeedImage) => {
  const data = await renderSeedImage(image);
  const incoming = path.join(incomingPostUploadPath(uploadId), image.name);

  await writeFile(incoming, data);

  const uploaded = await handleUploadPostImage(uploadId, image.name, {
    path: incoming,
    byteSize: data.byteLength,
  });

  if (uploaded.error) throw new Error(uploaded.message);
};

const uploadImages = async (
  headerImage: SeedImage | undefined,
  inlineImages: SeedImage[],
) => {
  if (!headerImage && inlineImages.length === 0) return undefined;

  const started = await handleCreatePostUpload({
    headerImage: headerImage?.name,
    inlineImages: inlineImages.map((image) => image.name),
  });

  if (started.error) throw new Error(started.message);

  const { uploadId } = started;

  return discardPostUploadOnFailure(uploadId, async () => {
    for (const image of headerImage
      ? [headerImage, ...inlineImages]
      : inlineImages) {
      await uploadImage(uploadId, image);
    }

    return uploadId;
  });
};

const finishWrite = async (
  { response, thumbnails }: PostWrite<PostResponse>,
  uploadId: string | undefined,
) => {
  if (response.error) {
    if (uploadId !== undefined) await discardPostUpload(uploadId);
    throw new Error(response.message);
  }

  if (thumbnails) await queuePostThumbnails(thumbnails);

  return response.post;
};

const publishPost = async (author: UserNoPassword, post: SeedPost) => {
  const uploadId = await uploadImages(
    post.headerImage,
    post.inlineImages ?? [],
  );
  const body = createPostBodySchema.parse({
    title: post.title,
    content: post.content,
    uploadId,
  });

  return finishWrite(await handleCreatePost(author, body), uploadId);
};

const editPost = async (current: Post, edit: SeedPostEdit) => {
  const uploadId = await uploadImages(
    edit.headerImage ?? undefined,
    edit.inlineImages ?? [],
  );
  const body = updatePostBodySchema.parse({
    title: edit.title ?? current.title,
    content: edit.content ?? current.content,
    headerImage: edit.headerImage === null ? null : undefined,
    removeInlineImages: edit.removeInlineImages,
    uploadId,
  });

  const written = await handleUpdatePost(current._id, body);
  if (!written) {
    throw new Error(`Post ${current._id} disappeared while seeding.`);
  }

  return finishWrite(written, uploadId);
};

const backdatePost = async (
  postId: string,
  position: number,
  revisions: number,
  now: number,
) => {
  const createdTime =
    now - (position + 1) * HOURS_BETWEEN_POSTS * MILLISECONDS_PER_HOUR;
  const revisionDate = (revision: number) =>
    new Date(
      createdTime + revision * HOURS_BETWEEN_REVISIONS * MILLISECONDS_PER_HOUR,
    );

  await PostModel.updateOne(
    { _id: postId },
    {
      $set: {
        createdDate: revisionDate(0),
        modifiedDate: revisionDate(revisions - 1),
        ...Object.fromEntries(
          Array.from({ length: revisions }, (_, revision) => [
            `revisions.${revision}.createdDate`,
            revisionDate(revision),
          ]),
        ),
      },
    },
  );
};

const seedPost = async (
  author: UserNoPassword,
  post: SeedPost,
  position: number,
  now: number,
) => {
  const edits = post.edits ?? [];
  let current = await publishPost(author, post);

  for (const edit of edits) current = await editPost(current, edit);

  await backdatePost(current._id, position, edits.length + 1, now);
};

const seedPosts = async () => {
  const posts = seedPostCatalogue(requestedPostCount());
  const now = Date.now();

  await mongoose.set("strictQuery", false).connect(requireEnv("MONGO_URI"));

  try {
    const author = await findAuthor();
    const seeded = await findSeededTitles(posts.map(seededTitle));

    for (const [position, post] of posts.entries()) {
      if (seeded.has(seededTitle(post))) continue;

      await seedPost(author, post, position, now);
      console.log(`Seeded ${seededTitle(post)}.`);
    }

    console.log(
      `Seeded ${posts.length - seeded.size} post(s), ${seeded.size} already existed.`,
    );
  } finally {
    await mongoose.disconnect();
  }
};

seedPosts().catch((e: unknown) => {
  console.error("Seeding blog posts failed:", e);
  process.exitCode = 1;
});
