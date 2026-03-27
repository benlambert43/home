export type CreateAccountRequestBody = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
  grecaptcharesponse: string;
};

export type SignInRequestBody = {
  email: string;
  password: string;
};

export type RequestNewEmailVerificationRequestBody = {
  grecaptcharesponse: string;
};
