import * as z from "zod";

const siteVerifyResponseSchema = z.object({ success: z.boolean() });
const errorResponseSchema = z.object({ message: z.string() });

export const handleVerifyCaptcha = async (
  providedUnverifiedCaptchaToken: string,
) => {
  const recaptchaPrivateKey = process.env.CAPTCHA_SECRET;

  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaPrivateKey}&response=${providedUnverifiedCaptchaToken}`;

  try {
    const response = await fetch(url, {
      method: "POST",
    });
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
