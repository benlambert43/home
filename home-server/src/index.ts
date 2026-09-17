import { setTimeout as sleep } from "node:timers/promises";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import apiRouter from "./api/api";
import { STORAGE_ROOT } from "./api/v1/fileOperations/storagePath";
import { handleNotFound } from "./api/v1/http/handleNotFound";
import { handleRequestError } from "./api/v1/http/handleRequestError";
import { requireDatabase } from "./api/v1/http/requireDatabase";
import { sendSuccess } from "./api/v1/http/respond";
import { resumePostThumbnails } from "./api/v1/post/postThumbnails";

const POSTS_PATH = "/api/v1/posts";

const parseJsonBody = express.json();

const app = express();

app.use((req, res, next) =>
  req.path.startsWith(POSTS_PATH) ? next() : parseJsonBody(req, res, next),
);
app.use(
  cors({
    origin: process.env.BASE_FRONTEND_URL
      ? new URL(process.env.BASE_FRONTEND_URL).origin
      : false,
  }),
);

const API_PORT = process.env.API_PORT;

const MONGO_RETRY_SECONDS = 5;

const connectToMongo = async () => {
  for (;;) {
    try {
      await mongoose.connect(process.env.MONGO_URI || "", {});
      return;
    } catch (e) {
      if (!(e instanceof mongoose.Error.MongooseServerSelectionError)) throw e;

      console.error(
        `MongoDB connection failed, retrying in ${MONGO_RETRY_SECONDS} seconds:`,
        e,
      );
      await sleep(MONGO_RETRY_SECONDS * 1000);
    }
  }
};

mongoose.set("strictQuery", false);

connectToMongo().then(
  () => {
    console.log("MongoDB connected.");
    void resumePostThumbnails();
  },
  (e: unknown) => {
    console.error("MongoDB connection failed:", e);
    process.exit(1);
  },
);

app.get("/", (req, res) =>
  sendSuccess(res, { message: "Welcome to home-server." }),
);

app.use("/api", requireDatabase, apiRouter);

app.use(handleNotFound);

app.use(handleRequestError);

app.listen(API_PORT, () => {
  console.log(`home-server is running on port ${API_PORT}`);
  console.log(`home-server stores post files in ${STORAGE_ROOT}`);
});
