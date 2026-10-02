import Image from "next/image";
import { Suspense } from "react";
import HeroMountains, {
  HeroMountainsPlaceholder,
} from "@/app/components/HeroMountains";
import { getAnimationsPaused } from "@/app/lib/animationsPaused";
import { PERSON_NAME, PERSON_PORTRAIT_PATH } from "@/app/lib/person";

const CookieHeroMountains = async () => (
  <HeroMountains initialPaused={await getAnimationsPaused()} />
);

const Hero = () => (
  <div className="relative flex flex-col items-center justify-center pt-8">
    <div className="flex min-w-full items-center justify-end">
      <div
        className="flex min-w-1/2 flex-wrap-reverse items-center justify-center
          gap-y-2"
      >
        <div className="px-4">
          <h1>Hi there! My name is {PERSON_NAME}.</h1>
          <p>I am:</p>

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
            src={PERSON_PORTRAIT_PATH}
            width={500}
            height={500}
            alt="A selfie of me, Ben Lambert. I'm a man with short brown hair and round tortoiseshell glasses."
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
