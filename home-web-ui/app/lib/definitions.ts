export type SignUpFormState =
  | {
      errors: string[];
      values: {
        firstname?: string;
        lastname?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
        grecaptcharesponse?: string;
      };
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
            grecaptcharesponse?:
              | {
                  errors: string[];
                }
              | undefined;
          }
        | undefined;
    }
  | undefined;

export type SignInFormState =
  | {
      errors: string[];
      values: {
        email?: string;
        password?: string;
      };
      properties?:
        | {
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
          }
        | undefined;
    }
  | undefined;

export type RequestNewEmailVerificationFormState =
  | {
      errors: string[];
      success?: boolean;
      properties?:
        | {
            grecaptcharesponse?:
              | {
                  errors: string[];
                }
              | undefined;
          }
        | undefined;
    }
  | undefined;

export type ChangeUsernameFormState =
  | {
      errors: string[];
      values: {
        newUsername?: string;
      };
      success?: boolean;
      properties: {
        newUsername?: {
          errors: string[];
        };
      };
    }
  | undefined;
