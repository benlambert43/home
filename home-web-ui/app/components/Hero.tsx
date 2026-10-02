import { cookies } from "next/headers";
import Image from "next/image";
import { Suspense } from "react";
import HeroMountains, {
  HeroMountainsPlaceholder,
} from "@/app/components/HeroMountains";
import { getAnimationsPaused } from "@/app/lib/animationsPaused";
import { MOUNTAINS_PLAYED_COOKIE } from "@/app/lib/heroMountains";
import { ALWAYS_PLAY_HOMEPAGE_ANIMATION } from "@/app/lib/publicEnv";

const CookieHeroMountains = async () => {
  const cookieStore = await cookies();
  const paused = await getAnimationsPaused();
  const played =
    !ALWAYS_PLAY_HOMEPAGE_ANIMATION && cookieStore.has(MOUNTAINS_PLAYED_COOKIE);

  return <HeroMountains autoplay={!paused && !played} initialPaused={paused} />;
};

const Hero = () => (
  <div className="relative flex flex-col items-center justify-center pt-8">
    <div className="flex min-w-full items-center justify-end">
      <div
        className="flex min-w-1/2 flex-wrap-reverse items-center justify-center
          gap-y-2"
      >
        <div className="px-4">
          <h1>Hi there!</h1>
          <h2>My name is Ben.</h2>
          <h2>I am:</h2>

          <ul className="list-inside list-disc">
            <li>a software developer</li>
            <li>a novice wildlife photographer</li>
            <li>living in Denver, CO</li>
          </ul>
        </div>
        <div
          className="mx-4 max-h-40 max-w-40 overflow-clip rounded-tl-4xl
            rounded-tr-4xl rounded-br-4xl rounded-bl-xl"
        >
          <Image
            priority
            src="/selfie.png"
            width={500}
            height={500}
            alt="A selfie of Ben"
          />
        </div>
      </div>
    </div>
    <Suspense fallback={<HeroMountainsPlaceholder />}>
      <CookieHeroMountains />
    </Suspense>
  </div>
);

export default Hero;
