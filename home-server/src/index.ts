import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import apiRouter from "./api/api";
import { sendSuccess } from "./api/v1/http/respond";

const app = express();
app.use(express.json());
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
