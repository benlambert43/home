import { pageMetadata } from "@/app/lib/metadata";

export const metadata = pageMetadata("about");

const About = () => {
  return (
    <div className="flex flex-col gap-4 p-5">
      <h1 className="text-4xl font-bold">About</h1>
    </div>
  );
};

export default About;
