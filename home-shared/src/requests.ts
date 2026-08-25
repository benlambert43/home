export interface CreateAccountRequestBody {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  grecaptcharesponse: string;
}

export interface SignInRequestBody {
  email: string;
  password: string;
}

export interface RequestNewEmailVerificationRequestBody {
  grecaptcharesponse: string;
}

export interface ChangeUsernameRequestBody {
  newUsername: string;
}
