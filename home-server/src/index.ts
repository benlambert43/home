import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import apiRouter from "./api/api";
import { sendSuccess } from "./api/v1/http/respond";

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

mongoose
  .set("strictQuery", false)
  .connect(process.env.MONGO_URI || "", {})
  .then(() => {
    console.log("MongoDB connected.");
  })
  .catch((err: unknown) => console.error("MongoDB connection failed:", err));

app.get("/", (req, res) =>
  sendSuccess(res, { message: "Welcome to home-server." }),
);

app.use("/api", apiRouter);

app.listen(API_PORT, () => {
  console.log(`home-server is running on port ${API_PORT}`);
});
