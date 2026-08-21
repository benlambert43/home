import { Cog6ToothIcon, UserCircleIcon } from "@heroicons/react/16/solid";
import Link from "next/link";
import { getBffSessionUser } from "@/app/auth/getBffSessionUser";
import { Notifications } from "@/app/components/Notifications";

const SignIn = () => {
  return (
    <div className="min-w-12">
      <Link href="/signin">sign in</Link>
    </div>
  );
};

const Profile = () => {
  return (
    <div>
      <Link href="/profile">
        <UserCircleIcon className="size-6" />
      </Link>
    </div>
  );
};

const Settings = () => {
  return (
    <div>
      <Link href="/settings">
        <Cog6ToothIcon className="size-6" />
      </Link>
    </div>
  );
};

const Navbar = async () => {
  const user = await getBffSessionUser();

  return (
    <nav
      className="relative mx-2 flex flex-row flex-wrap-reverse items-center
        justify-between gap-x-8 gap-y-6 rounded-xl bg-slate-600 px-6 py-4"
    >
      <div className="flex flex-4 flex-wrap items-center justify-start gap-4">
        <Link href="/">benlambert.tech</Link>
        <Link href="/blog">blog</Link>
        <Link href="/projects">projects</Link>
        <Link href="/about">about</Link>
      </div>
      <div className="flex flex-1 items-center gap-4 sm:justify-end">
        {user ? (
          <>
            <Notifications />
            <Settings />
            <Profile />
          </>
        ) : (
          <SignIn />
        )}
      </div>
    </nav>
  );
};

export default Navbar;
