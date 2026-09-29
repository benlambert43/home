import "server-only";
import { ANIMATIONS_PAUSED_COOKIE } from "@/app/lib/animationsPausedCookie";
import { cookies } from "next/headers";

export const getAnimationsPaused = async () =>
  (await cookies()).get(ANIMATIONS_PAUSED_COOKIE)?.value === "true";
