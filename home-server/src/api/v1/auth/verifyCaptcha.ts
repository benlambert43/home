import * as z from "zod";

const siteVerifyResponseSchema = z.object({ success: z.boolean() });
const errorResponseSchema = z.object({ message: z.string() });

export const handleVerifyCaptcha = async (
  providedUnverifiedCaptchaToken: string,
) => {
  try {
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET}&response=${providedUnverifiedCaptchaToken}`,
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
    if (!siteVerifyResponse.success) {
      return { success: false };
    }

    return { success: siteVerifyResponse.data.success };
  } catch {
    return { success: false };
  }
};
