import mongoose, { Types } from "mongoose";
import { fingerprint } from "../api/v1/fileOperations/fingerprint";
import { writePostRevision } from "../api/v1/fileOperations/postStorage";
import { PostModel } from "../api/v1/model/postModel";
import { UserModel } from "../api/v1/model/userModel";

const DEFAULT_POST_COUNT = 25;

const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

const postTitle = (number: number) => `Test Post ${number}`;

const postContent = (number: number) =>
  `# ${postTitle(number)}\n\nTest Post Content ${number}: ${LOREM}\n`;

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

const findAuthor = async () => {
  const email = requireEnv("ADMIN_EMAIL");
  const author = await UserModel.findOne({ email });

  if (!author) {
    throw new Error(
      `No account with the email ${email}, create the admin account before seeding.`,
    );
  }

  return author._id;
};

const findSeededTitles = async (titles: string[]) => {
  const posts = await PostModel.find({ title: { $in: titles } }).select(
    "title",
  );

  return new Set(posts.map((post) => post.title));
};

const seedPost = async (authorUserId: Types.ObjectId, number: number) => {
  const _id = new Types.ObjectId();
  const createdDate = new Date();
  const postFingerprint = fingerprint(
    _id.toHexString(),
    createdDate.toISOString(),
  );

  await new PostModel({
    _id,
    title: postTitle(number),
    fingerprint: postFingerprint,
    authorUserId,
    createdDate,
    modifiedDate: createdDate,
    revisions: [
      await writePostRevision(postFingerprint, {
        content: postContent(number),
        inlineImages: [],
      }),
    ],
  }).save();
};

const seedPosts = async () => {
  const numbers = Array.from({ length: requestedPostCount() }, (_, i) => i + 1);

  await mongoose.set("strictQuery", false).connect(requireEnv("MONGO_URI"));

  try {
    const authorUserId = await findAuthor();
    const seeded = await findSeededTitles(numbers.map(postTitle));
    const missing = numbers.filter((number) => !seeded.has(postTitle(number)));

    for (const number of missing) {
      await seedPost(authorUserId, number);
      console.log(`Seeded ${postTitle(number)}.`);
    }

    console.log(
      `Seeded ${missing.length} post(s), ${seeded.size} already existed.`,
    );
  } finally {
    await mongoose.disconnect();
  }
};

seedPosts().catch((e: unknown) => {
  console.error("Seeding blog posts failed:", e);
  process.exitCode = 1;
});
