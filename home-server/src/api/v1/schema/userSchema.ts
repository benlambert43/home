import mongoose from "mongoose";

const caseInsensitive = { locale: "en", strength: 2 };

export const userSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true },
    username: { type: String, required: true },
    confirmedEmail: { type: Boolean, required: true },
    userBanned: { type: Boolean, required: true },
    password: { type: String, required: true },
    createdDate: { type: Date, required: true },
    modifiedDate: { type: Date, required: true },
    role: { type: String, enum: ["user", "admin"], required: true },
    termsConsent: { type: Boolean, required: true },
    newsletterConsent: { type: Boolean, required: true },
    marketingConsent: { type: Boolean, required: true },
  },
  { collation: caseInsensitive },
);

userSchema.index({ email: 1 }, { unique: true, collation: caseInsensitive });
userSchema.index({ username: 1 }, { unique: true, collation: caseInsensitive });
