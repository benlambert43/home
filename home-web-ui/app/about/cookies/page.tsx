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
      signed in, to remember one preference, and to keep the home page header
      animation from replaying each time you return to it. It does not use
      cookies for analytics, advertising, or tracking, and it sets nothing until
      you open the home page, sign in, change that preference, or choose to load
      reCAPTCHA.
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
      <li>
        <code>mountainsPlayed</code> remembers that the header animation on the
        home page has already played, so it does not play again every time you
        come back. It is set each time you open the home page, and lasts 30
        minutes after you last open it.
      </li>
    </ul>
    <p>
      The two session cookies hold a signed token that identifies your account.
      They are marked so that only the site&apos;s server can read them, not
      scripts running in the page, and they are sent only over HTTPS. Logging
      out deletes both. The animation preference cookie holds the word true or
      false and nothing else, and <code>mountainsPlayed</code> holds only the
      word true.
    </p>

    <h2>Cookies set by Google reCAPTCHA</h2>
    <p>
      The create account, forgot password, and request new verification link
      pages include Google reCAPTCHA, which protects the site&apos;s forms from
      automated programs. Google&apos;s script loads only after you choose to
      load reCAPTCHA on one of those pages, and it may then set its own cookies,
      such as <code>_GRECAPTCHA</code>, on Google&apos;s domain, for its risk
      analysis. Your choice lasts only until you leave or reload the page. This
      site does not read those cookies. Google describes them in its page on{" "}
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
      cookie, animations will play on each visit. If you block{" "}
      <code>mountainsPlayed</code>, the home page header animation will play
      every time you open the home page. The site does not use local storage or
      any other way of keeping information in your browser.
    </p>
  </Notice>
);

export default CookieNotice;
