import mongoose, { Schema } from "mongoose";

const postFileFields = {
  name: { type: String, required: true },
  file: { type: String, required: true },
  contentType: { type: String, required: true },
  byteSize: { type: Number, required: true },
};

const postFileSchema = new mongoose.Schema(postFileFields, { _id: false });

const postImageSchema = new mongoose.Schema(
  {
    ...postFileFields,
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  { _id: false },
);

const postRevisionSchema = new mongoose.Schema(
  {
    fingerprint: { type: String, required: true },
    createdDate: { type: Date, required: true },
    content: { type: postFileSchema, required: true },
    headerImage: { type: postImageSchema, required: false },
    inlineImages: { type: [postImageSchema], required: true },
  },
  { _id: false },
);

export const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    fingerprint: { type: String, required: true, unique: true },
    authorUserId: { type: Schema.Types.ObjectId, required: true },
    createdDate: { type: Date, required: true },
    modifiedDate: { type: Date, required: true },
    revisions: { type: [postRevisionSchema], required: true },
  },
  { optimisticConcurrency: true },
);

postSchema.index({ createdDate: -1 });
