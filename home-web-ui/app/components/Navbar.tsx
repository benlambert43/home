import { Cog6ToothIcon } from "@heroicons/react/16/solid";
import Link from "next/link";

const Navbar = () => {
  return (
    <div
      className="flex min-w-full flex-row flex-wrap-reverse items-center
        justify-between gap-x-8 gap-y-6 rounded-xl bg-slate-600 px-6 py-4"
    >
      <div className="flex flex-4 flex-wrap items-center justify-start gap-4">
        <Link href="/">benlambert.tech</Link>
        <Link href="/blog">blog</Link>
        <Link href="/projects">projects</Link>
        <Link href="/about">about</Link>
      </div>
      <div className="flex flex-1 items-center gap-4 sm:justify-end">
        <div>
          <Link href="/">
            <Cog6ToothIcon className="size-6" />
          </Link>
        </div>
        <div className="min-w-12">
          <Link href="/">sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
