import * as z from "zod";

const siteVerifyResponseSchema = z.object({ success: z.boolean() });
const errorResponseSchema = z.object({ message: z.string() });

export const verifyCaptcha = async (unverifiedCaptchaToken: string) => {
  try {
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET}&response=${unverifiedCaptchaToken}`,
      { method: "POST" },
    );

    if (!response.ok) {
      const errorResponse = errorResponseSchema.safeParse(
        await response.json(),
      );
      throw new Error(
        errorResponse.success
          ? errorResponse.data.message
          : `response.status ${response.status}`,
      );
    }

    const siteVerifyResponse = siteVerifyResponseSchema.safeParse(
      await response.json(),
    );

    return siteVerifyResponse.success && siteVerifyResponse.data.success;
  } catch (e) {
    console.error("Captcha verification failed:", e);
    return false;
  }
};
