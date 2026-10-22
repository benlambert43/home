import NavDrawer from "@/app/components/NavDrawer";
import {
  NavLink,
  NAV_LINKS,
  PROFILE_LINK,
  SETTINGS_LINK,
  SIGN_IN_LINK,
} from "@/app/components/navLinks";
import NotificationIcon from "@/app/components/NotificationIcon";
import { Notifications } from "@/app/components/Notifications";
import SessionActions from "@/app/components/SessionActions";
import StickyNav from "@/app/components/StickyNav";
import {
  NAV_ICON_LINK_CLASSES,
  NAV_TEXT_LINK_CLASSES,
} from "@/app/ui/navStyles";
import Link from "next/link";

const SignIn = () => {
  return (
    <div className="min-w-12">
      <Link href={SIGN_IN_LINK.href} className={NAV_TEXT_LINK_CLASSES}>
        {SIGN_IN_LINK.label}
      </Link>
    </div>
  );
};

const AccountIconLink = ({ href, label, Icon }: NavLink) => {
  return (
    <Link href={href} aria-label={label} className={NAV_ICON_LINK_CLASSES}>
      <Icon className="size-6" />
    </Link>
  );
};

const AccountLinks = () => {
  return (
    <>
      <div className="hidden items-center gap-4 sm:flex">
        <NotificationIcon />
        <AccountIconLink {...SETTINGS_LINK} />
      </div>
      <AccountIconLink {...PROFILE_LINK} />
    </>
  );
};

const Navbar = () => {
  return (
    <StickyNav>
      <Notifications>
        <div className="flex items-center gap-4">
          <NavDrawer />
          <Link href="/" className={NAV_TEXT_LINK_CLASSES}>
            benlambert.tech
          </Link>
          <div className="hidden items-center gap-4 sm:flex">
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} className={NAV_TEXT_LINK_CLASSES}>
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex min-h-6 items-center gap-4">
          <SessionActions signedOut={<SignIn />} signedIn={<AccountLinks />} />
        </div>
      </Notifications>
    </StickyNav>
  );
};

export default Navbar;
