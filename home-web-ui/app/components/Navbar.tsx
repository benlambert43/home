import { Cog6ToothIcon, UserCircleIcon } from "@heroicons/react/16/solid";
import Link from "next/link";
import { Suspense } from "react";
import { Notifications } from "@/app/components/Notifications";
import SessionActions from "@/app/components/SessionActions";
import StickyNav from "@/app/components/StickyNav";
import {
  NAV_ICON_LINK_CLASSES,
  NAV_TEXT_LINK_CLASSES,
} from "@/app/ui/navStyles";

const SignIn = () => {
  return (
    <div className="min-w-12">
      <Link href="/signin" className={NAV_TEXT_LINK_CLASSES}>
        sign in
      </Link>
    </div>
  );
};

const Profile = () => {
  return (
    <div>
      <Link
        href="/profile"
        aria-label="Profile"
        className={NAV_ICON_LINK_CLASSES}
      >
        <UserCircleIcon className="size-6" />
      </Link>
    </div>
  );
};

const Settings = () => {
  return (
    <div>
      <Link
        href="/settings"
        aria-label="Settings"
        className={NAV_ICON_LINK_CLASSES}
      >
        <Cog6ToothIcon className="size-6" />
      </Link>
    </div>
  );
};

const Navbar = () => {
  return (
    <StickyNav>
      <div className="flex flex-4 flex-wrap items-center justify-start gap-4">
        <Link href="/" className={NAV_TEXT_LINK_CLASSES}>
          benlambert.tech
        </Link>
        <Link href="/blog" className={NAV_TEXT_LINK_CLASSES}>
          blog
        </Link>
        <Link href="/projects" className={NAV_TEXT_LINK_CLASSES}>
          projects
        </Link>
        <Link href="/about" className={NAV_TEXT_LINK_CLASSES}>
          about
        </Link>
      </div>
      <div className="flex min-h-6 flex-1 items-center gap-4 sm:justify-end">
        <Suspense fallback={<SignIn />}>
          <SessionActions
            signedOut={<SignIn />}
            signedIn={
              <>
                <Notifications />
                <Settings />
                <Profile />
              </>
            }
          />
        </Suspense>
      </div>
    </StickyNav>
  );
};

export default Navbar;
