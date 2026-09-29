export const ANIMATIONS_PAUSED_COOKIE = "animationsPaused";

const PAUSED_MAX_AGE_SECONDS = 60 * 60 * 24 * 400;

export const setAnimationsPausedCookie = (paused: boolean) => {
  document.cookie = `${ANIMATIONS_PAUSED_COOKIE}=${paused}; path=/; max-age=${PAUSED_MAX_AGE_SECONDS}; samesite=lax`;
};
