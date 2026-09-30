import Notice from "@/app/about/Notice";
import { PRIVACY_NOTICE } from "@/app/about/notices";
import { pageMetadata } from "@/app/lib/metadata";
import Link from "next/link";

export const metadata = pageMetadata("cookie notice");

const GOOGLE_PRIVACY_POLICY_URL = "https://policies.google.com/privacy";

const GOOGLE_COOKIES_URL = "https://policies.google.com/technologies/cookies";

const CookieNotice = () => (
  <Notice title="Cookie Notice" updated="2026-09-30">
    <p>
      Cookies are small pieces of text that a website asks your browser to keep
      and send back on later visits. This site uses cookies only to keep you
      signed in and to remember one preference. It does not use cookies for
      analytics, advertising, or tracking, and it sets nothing until you sign
      in, change that preference, or open a page that includes reCAPTCHA.
    </p>

    <h2>Cookies this site sets</h2>
    <ul>
      <li>
        <code>apisession</code> keeps you signed in to the site&apos;s API. It
        is set when you sign in, create an account, or verify your email
        address, and lasts 7 days or until you log out.
      </li>
      <li>
        <code>bffsession</code> keeps you signed in to the site itself and tells
        it who you are. It is set and expires at the same times as{" "}
        <code>apisession</code>.
      </li>
      <li>
        <code>animationsPaused</code> remembers whether you have paused the
        site&apos;s animations. It is set when you use the pause or play
        control, and lasts 400 days after you last use it.
      </li>
    </ul>
    <p>
      The two session cookies hold a signed token that identifies your account.
      They are marked so that only the site&apos;s server can read them, not
      scripts running in the page, and they are sent only over HTTPS. Logging
      out deletes both. The animation preference cookie holds the word true or
      false and nothing else.
    </p>

    <h2>Cookies set by Google reCAPTCHA</h2>
    <p>
      The create account, forgot password, and request new verification link
      pages include Google reCAPTCHA, which protects the site&apos;s forms from
      automated programs. When you open one of those pages, Google&apos;s script
      loads and may set its own cookies, such as <code>_GRECAPTCHA</code>, on
      Google&apos;s domain, for its risk analysis. This site does not read those
      cookies. Google describes them in its page on{" "}
      <a href={GOOGLE_COOKIES_URL} target="_blank" rel="noopener noreferrer">
        how Google uses cookies
      </a>{" "}
      and in the{" "}
      <a
        href={GOOGLE_PRIVACY_POLICY_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        Google Privacy Policy
      </a>
      . The <Link href={PRIVACY_NOTICE.href}>{PRIVACY_NOTICE.title}</Link>{" "}
      explains what else reCAPTCHA collects.
    </p>

    <h2>Controlling cookies</h2>
    <p>
      You can delete or block cookies in your browser&apos;s settings; each
      browser&apos;s help pages explain how. If you block the session cookies
      you will not be able to stay signed in, and if you block the preference
      cookie, animations will play on each visit. The site does not use local
      storage or any other way of keeping information in your browser.
    </p>
  </Notice>
);

export default CookieNotice;
