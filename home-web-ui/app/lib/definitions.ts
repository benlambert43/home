import * as z from "zod";

export const SignupFormSchema = z
  .object({
    firstname: z
      .string()
      .min(2, { message: "⚠️ First name must be at least 2 characters long." }),
    lastname: z
      .string()
      .min(2, { message: "⚠️ Last name must be at least 2 characters long." }),
    username: z
      .string()
      .min(3, { message: "⚠️ Username must be at least 3 characters long." }),
    email: z.email({ message: "⚠️ Please enter a valid email." }),
    password: z
      .string()
      .min(8, { message: "⚠️ Password must be at least 8 characters long." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "⚠️ Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignupFormState =
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
            username?:
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
