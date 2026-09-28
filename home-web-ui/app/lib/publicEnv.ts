export const requireEnvironmentVariable = (
  name: string,
  value: string | undefined,
) => {
  if (!value) {
    throw new Error(`The environment variable ${name} is not set.`);
  }

  return value;
};

export const CAPTCHA_PUBLIC = requireEnvironmentVariable(
  "NEXT_PUBLIC_CAPTCHA_PUBLIC",
  process.env.NEXT_PUBLIC_CAPTCHA_PUBLIC,
);

export const ALWAYS_PLAY_MOUNTAINS =
  process.env.NEXT_PUBLIC_ALWAYS_PLAY_MOUNTAINS === "true";
