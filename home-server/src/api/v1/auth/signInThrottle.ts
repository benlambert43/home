import dayjs from "dayjs";
import { SignInAttemptModel } from "../model/signInAttemptModel";
import { ApiError } from "../http/apiError";
import { tooManySignInAttempts } from "../http/messages";

const MAX_SIGN_IN_ATTEMPTS = 5;
const SIGN_IN_ATTEMPT_WINDOW_MINUTES = 15;

const attemptKey = (email: string) => email.toLowerCase();

export const claimSignInAttempt = async (email: string) => {
  const now = dayjs();
  const key = attemptKey(email);

  await SignInAttemptModel.deleteOne({
    email: key,
    expiresDate: { $lte: now.toDate() },
  });

  const { attempts, expiresDate } = await SignInAttemptModel.findOneAndUpdate(
    { email: key },
    {
      $inc: { attempts: 1 },
      $setOnInsert: {
        expiresDate: now.add(SIGN_IN_ATTEMPT_WINDOW_MINUTES, "minute").toDate(),
      },
    },
    { upsert: true, returnDocument: "after" },
  ).orFail();

  if (attempts > MAX_SIGN_IN_ATTEMPTS) {
    const minutesLeft = Math.max(
      1,
      Math.ceil(dayjs(expiresDate).diff(now, "minute", true)),
    );
    throw new ApiError(tooManySignInAttempts(minutesLeft), 429);
  }
};

export const clearSignInAttempts = async (email: string) => {
  await SignInAttemptModel.deleteOne({ email: attemptKey(email) });
};
