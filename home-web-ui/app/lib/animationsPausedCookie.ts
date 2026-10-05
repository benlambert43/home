const ANIMATIONS_PAUSED_COOKIE = "animationsPaused";

const PAUSED_MAX_AGE_SECONDS = 60 * 60 * 24 * 400;

let savedPaused: boolean | undefined;

export const readAnimationsPausedCookie = () => {
  savedPaused ??= document.cookie
    .split("; ")
    .includes(`${ANIMATIONS_PAUSED_COOKIE}=true`);

  return savedPaused;
};

export const setAnimationsPausedCookie = (paused: boolean) => {
  document.cookie = `${ANIMATIONS_PAUSED_COOKIE}=${paused}; path=/; max-age=${PAUSED_MAX_AGE_SECONDS}; samesite=lax`;
};
