export const handleVerifyCaptcha = async (
  providedUnverifiedCaptchaToken: string
) => {
  const recaptchaPrivateKey = process.env.CAPTCHA_SECRET;

  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaPrivateKey}&response=${providedUnverifiedCaptchaToken}`;

  try {
    const response = await fetch(url, {
      method: "POST",
    });
    if (!response.ok) {
      const maybeResponse = await response.json();
      const maybeResponseMessage = maybeResponse?.message;
      throw new Error(
        maybeResponseMessage
          ? maybeResponseMessage
          : `response.status ${response.status}`
      );
    }

    const json = await response.json();

    if (json?.success && json?.success === true) {
      return { success: true };
    } else {
      return { success: false };
    }
  } catch (e) {
    console.error(e);
    return { success: false };
  }
};
