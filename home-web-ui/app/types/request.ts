export type CreateAccountRequestBody = {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  grecaptcharesponse: string;
};
