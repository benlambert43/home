import AnimationsPauseButton from "@/app/components/AnimationsPauseButton";
import Mountains from "@/app/ui/Mountains";

const HeroMountains = () => (
  <>
    <div className="absolute top-2 left-4 flex">
      <AnimationsPauseButton />
    </div>
    <div className="max-w-full overflow-clip">
      <Mountains />
    </div>
  </>
);

export default HeroMountains;
