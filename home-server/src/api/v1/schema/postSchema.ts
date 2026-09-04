import mongoose, { Schema } from "mongoose";

const postFileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    file: { type: String, required: true },
    contentType: { type: String, required: true },
    byteSize: { type: Number, required: true },
  },
  { _id: false },
);

const postRevisionSchema = new mongoose.Schema(
  {
    fingerprint: { type: String, required: true },
    createdDate: { type: Date, required: true },
    content: { type: postFileSchema, required: true },
    headerImage: { type: postFileSchema, required: true },
    inlineImages: { type: [postFileSchema], required: true },
  },
  { _id: false },
);

export const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fingerprint: { type: String, required: true, unique: true },
  authorUserId: { type: Schema.Types.ObjectId, required: true },
  createdDate: { type: Date, required: true },
  modifiedDate: { type: Date, required: true },
  revisions: { type: [postRevisionSchema], required: true },
});

postSchema.index({ createdDate: -1 });
