import * as z from "zod";
import { containsRawHtml, normalizePostContent } from "./markdown";
import {
  DEFAULT_POST_PAGE_SIZE,
  MAX_POST_CONTENT_CHARACTERS,
  MAX_POST_IMAGE_BYTES,
  MAX_POST_INLINE_IMAGE_NAME_CHARACTERS,
  MAX_POST_INLINE_IMAGES,
  MAX_POST_PAGE_SIZE,
  MAX_POST_TITLE_CHARACTERS,
} from "./post";

const nameField = (label: string) =>
  z
    .string()
    .min(2, { message: `${label} must be at least 2 characters long.` });

const emailField = z.email({ message: "Please enter a valid email." });

const passwordField = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long." });

const currentPasswordField = z
  .string()
  .min(1, { message: "Please enter your current password." });

const captchaField = z.string().min(1, {
  message:
    "Please complete the ReCAPTCHA challenge, or reload the page and try again.",
});

const usernameField = z
  .string()
  .min(2, { message: "Username must be at least 2 characters long." })
  .regex(/^[a-zA-Z0-9_-]+$/, {
    message: "Only letters, numbers, dashes, and underscores are allowed.",
  });

const emailedCodeField = (message: string) =>
  z.string().regex(/^[0-9a-f]{64}$/, { message });

const verificationCodeField = emailedCodeField("Invalid verification code.");

const passwordResetCodeField = emailedCodeField("Invalid password reset link.");

export const createAccountBodySchema = z.object({
  firstname: nameField("First name"),
  lastname: nameField("Last name"),
  email: emailField,
  password: passwordField,
  grecaptcharesponse: captchaField,
});

export const createAccountFormSchema = createAccountBodySchema
  .extend({ confirmPassword: passwordField })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const signInBodySchema = z.object({
  email: emailField,
  password: passwordField,
});

export const verifyEmailParamsSchema = z.object({
  username: usernameField,
  email: emailField,
  code: verificationCodeField,
});

export const requestNewEmailVerificationLinkBodySchema = z.object({
  grecaptcharesponse: captchaField,
});

export const changeUsernameBodySchema = z.object({
  newUsername: usernameField,
});

export const changePasswordBodySchema = z.object({
  currentPassword: currentPasswordField,
  newPassword: passwordField,
});

export const changePasswordFormSchema = changePasswordBodySchema
  .extend({ confirmNewPassword: passwordField })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match.",
    path: ["confirmNewPassword"],
  });

export const requestPasswordResetBodySchema = z.object({
  email: emailField,
  grecaptcharesponse: captchaField,
});

export const passwordResetLinkParamsSchema = z.object({
  code: passwordResetCodeField,
});

export const resetPasswordBodySchema = z.object({
  code: passwordResetCodeField,
  newPassword: passwordField,
});

export const resetPasswordFormSchema = resetPasswordBodySchema
  .extend({ confirmNewPassword: passwordField })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match.",
    path: ["confirmNewPassword"],
  });

const DISALLOWED_TITLE_CHARACTERS = /[\p{Cc}\u202A-\u202E\u2066-\u2069]/u;

const IMAGE_DATA_URL_PREFIX = /^data:image\/[a-z0-9.+-]+;base64,/i;

const BASE64_CHARACTERS = /^[A-Za-z0-9+/]+={0,2}$/;

const hasDisallowedContentCharacters = (content: string) =>
  /\p{Cc}/u.test(content.replace(/[\n\t]/g, ""));

const postTitleField = z
  .string()
  .transform((title) => title.normalize("NFC").trim())
  .refine((title) => title.length > 0, {
    message: "Please enter a post title.",
  })
  .refine((title) => [...title].length <= MAX_POST_TITLE_CHARACTERS, {
    message: `Post title must be ${MAX_POST_TITLE_CHARACTERS} characters or fewer.`,
  })
  .refine((title) => !DISALLOWED_TITLE_CHARACTERS.test(title), {
    message: "Post title contains characters that are not allowed.",
  });

const postContentField = z
  .string()
  .transform(normalizePostContent)
  .refine((content) => content.length > 0, {
    message: "Please write some post content.",
  })
  .refine((content) => content.length <= MAX_POST_CONTENT_CHARACTERS, {
    message: `Post content must be ${MAX_POST_CONTENT_CHARACTERS.toLocaleString("en-US")} characters or fewer.`,
  })
  .refine((content) => !hasDisallowedContentCharacters(content), {
    message: "Post content contains characters that are not allowed.",
  })
  .refine((content) => !containsRawHtml(content), {
    message: "Post content may not contain HTML. Please use Markdown instead.",
  });

const base64ImageField = (label: string, maxBytes: number) => {
  const maxCharacters = Math.ceil(maxBytes / 3) * 4;

  return z
    .string()
    .transform((image) =>
      image.replace(IMAGE_DATA_URL_PREFIX, "").replace(/\s+/g, ""),
    )
    .refine((image) => image.length > 0, {
      message: `Please choose a ${label}.`,
    })
    .refine((image) => image.length <= maxCharacters, {
      message: `A ${label} must be smaller than ${maxBytes / (1024 * 1024)} MB.`,
    })
    .refine(
      (image) => image.length % 4 === 0 && BASE64_CHARACTERS.test(image),
      {
        message: `A ${label} must be a base64 encoded image.`,
      },
    );
};

const postHeaderImageField = base64ImageField(
  "header image",
  MAX_POST_IMAGE_BYTES,
);

const postInlineImageNameField = z
  .string()
  .max(MAX_POST_INLINE_IMAGE_NAME_CHARACTERS, {
    message: `An image name must be ${MAX_POST_INLINE_IMAGE_NAME_CHARACTERS} characters or fewer.`,
  })
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]*\.(png|jpe?g|webp|gif|avif)$/, {
    message:
      "An image name must be letters, numbers, dashes, or underscores, ending in .png, .jpg, .jpeg, .webp, .gif, or .avif.",
  });

const postInlineImagesField = z
  .array(
    z.object({
      name: postInlineImageNameField,
      data: base64ImageField("post image", MAX_POST_IMAGE_BYTES),
    }),
  )
  .max(MAX_POST_INLINE_IMAGES, {
    message: `A post may add at most ${MAX_POST_INLINE_IMAGES} images at a time.`,
  })
  .refine(
    (images) =>
      new Set(images.map((image) => image.name.toLowerCase())).size ===
      images.length,
    { message: "Each image in a post needs its own file name." },
  );

export const createPostBodySchema = z.object({
  title: postTitleField,
  content: postContentField,
  headerImage: postHeaderImageField.optional(),
  inlineImages: postInlineImagesField.default([]),
});

export const updatePostBodySchema = z
  .object({
    title: postTitleField.optional(),
    content: postContentField.optional(),
    headerImage: postHeaderImageField.nullable().optional(),
    inlineImages: postInlineImagesField.optional(),
    removeInlineImages: z.array(postInlineImageNameField).optional(),
  })
  .refine(
    (body) =>
      body.title !== undefined ||
      body.content !== undefined ||
      body.headerImage !== undefined ||
      (body.inlineImages?.length ?? 0) > 0 ||
      (body.removeInlineImages?.length ?? 0) > 0,
    { message: "Please change the title, the content, or the images." },
  );

export const postIdParamsSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid post id." })
    .transform((id) => id.toLowerCase()),
});

export const postInlineImageParamsSchema = postIdParamsSchema.extend({
  name: postInlineImageNameField,
});

export const postListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_POST_PAGE_SIZE)
    .default(DEFAULT_POST_PAGE_SIZE),
});
