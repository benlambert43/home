import * as z from "zod";

export const SignUpFormSchema = z
  .object({
    firstname: z
      .string()
      .min(2, { message: "⚠️ First name must be at least 2 characters long." }),
    lastname: z
      .string()
      .min(2, { message: "⚠️ Last name must be at least 2 characters long." }),
    email: z.email({ message: "⚠️ Please enter a valid email." }),
    password: z
      .string()
      .min(8, { message: "⚠️ Password must be at least 8 characters long." }),
    confirmPassword: z
      .string()
      .min(8, { message: "⚠️ Password must be at least 8 characters long." }),
    grecaptcharesponse: z.string().min(1, {
      message:
        "⚠️ Please complete the ReCAPTCHA challenge, or reload the page and try again.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "⚠️ Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignUpFormState =
  | {
      errors: string[];
      properties?:
        | {
            firstname?:
              | {
                  errors: string[];
                }
              | undefined;
            lastname?:
              | {
                  errors: string[];
                }
              | undefined;
            email?:
              | {
                  errors: string[];
                }
              | undefined;
            password?:
              | {
                  errors: string[];
                }
              | undefined;
            confirmPassword?:
              | {
                  errors: string[];
                }
              | undefined;
          }
        | undefined;
    }
  | undefined;

export const SignInFormSchema = z
  .object({
    firstname: z
      .string()
      .min(2, { message: "⚠️ First name must be at least 2 characters long." }),
    lastname: z
      .string()
      .min(2, { message: "⚠️ Last name must be at least 2 characters long." }),
    email: z.email({ message: "⚠️ Please enter a valid email." }),
    password: z
      .string()
      .min(8, { message: "⚠️ Password must be at least 8 characters long." }),
    confirmPassword: z
      .string()
      .min(8, { message: "⚠️ Password must be at least 8 characters long." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "⚠️ Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignInFormState =
  | {
      errors: string[];
      properties?:
        | {
            firstname?:
              | {
                  errors: string[];
                }
              | undefined;
            lastname?:
              | {
                  errors: string[];
                }
              | undefined;
            email?:
              | {
                  errors: string[];
                }
              | undefined;
            password?:
              | {
                  errors: string[];
                }
              | undefined;
            confirmPassword?:
              | {
                  errors: string[];
                }
              | undefined;
          }
        | undefined;
    }
  | undefined;
