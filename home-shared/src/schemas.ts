import * as z from "zod";

const nameField = (label: string) =>
  z
    .string()
    .min(2, { message: `${label} must be at least 2 characters long.` });

const emailField = z.email({ message: "Please enter a valid email." });

const passwordField = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long." });

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

const urlSafeField = z
  .string()
  .min(1)
  .regex(/^[a-zA-Z0-9-]+$/);

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
  username: urlSafeField,
  email: emailField,
  code: urlSafeField,
});

export const requestNewEmailVerificationLinkBodySchema = z.object({
  grecaptcharesponse: captchaField,
});

export const changeUsernameBodySchema = z.object({
  newUsername: usernameField,
});
