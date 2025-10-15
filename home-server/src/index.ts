import express from "express";
import { configDotenv } from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import userRouter from "./user/user";
import accountManagementRouter from "./accountManagement/accountManagement";

configDotenv();
const app = express();
app.use(express.json());
app.use(cors());

const API_PORT = process.env.API_PORT;

mongoose
  .set("strictQuery", false)
  .connect(process.env.MONGO_URI_ENV || "", {})
  .then(() => {
    console.log("MongoDB connected.");
  })
  .catch((err) => console.log(err))
  .finally(() => {});

app.get("/", (req, res) => {
  res.status(200).send({ message: "Welcome to home-server" });
});

app.use("/accountManagement", accountManagementRouter);
app.use("/user", userRouter);

app.listen(API_PORT, () => {
  console.log(`home-server is running on port ${API_PORT}`);
});
