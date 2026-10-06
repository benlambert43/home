import { RECAPTCHA_FAQ_URL } from "@/app/about/links";
import Notice from "@/app/about/Notice";
import { COOKIE_NOTICE, PRIVACY_NOTICE } from "@/app/about/notices";
import { pageMetadata } from "@/app/lib/metadata";
import Link from "next/link";

export const metadata = pageMetadata("cookie notice", {
  canonicalPath: COOKIE_NOTICE.href,
  description: COOKIE_NOTICE.description,
});

const CookieNotice = () => (
  <Notice title="Cookie Notice" updated="2026-10-05">
    <p>
      Cookies are small pieces of text that a website asks your browser to keep
      and send back on later visits. This site uses cookies only to keep you
      signed in and to remember one preference. It does not use cookies for
      analytics, advertising, or tracking, and it is designed to set nothing
      until you sign in, create an account, open an email verification link,
      change that preference, or choose to load reCAPTCHA.
    </p>

    <h2>Cookies this site sets</h2>
    <p>
      To the best of my knowledge, these are all the cookies the site's own code
      sets:
    </p>
    <ul>
      <li>
        <code>apisession</code> keeps you signed in to the site's API. It is set
        when you sign in, create an account, verify your email address, or
        change your username, password, or optional email choices, and lasts 7
        days from the last time it was set, or until you log out. Opening an
        email verification link sets it on the browser where you open the link,
        even if you were not signed in there.
      </li>
      <li>
        <code>bffsession</code> keeps you signed in to the site itself and tells
        it who you are. It is set and expires at the same times as{" "}
        <code>apisession</code>.
      </li>
      <li>
        <code>animationsPaused</code> remembers whether you have paused the
        site's animations. It is set when you use the pause or play control, and
        lasts 400 days after you last use it.
      </li>
    </ul>
    <p>
      The two session cookies each hold a token containing your account details:
      your account ID, name, email address, and username, when the account was
      created and last changed, whether your email address is verified, whether
      it is an administrator account, whether it has been suspended, and your
      current answers to the consent checkboxes, with the date and time you gave
      each one. The token is signed so that it cannot be altered, but it is not
      encrypted. The cookies are marked so that only the site's server can read
      them, not scripts running in the page, and they are sent only over HTTPS.
      Logging out or deleting your account deletes both from the browser you do
      it on. Session cookies in other browsers are not deleted, and last until
      you log out there or they expire. The animation preference cookie holds
      the word true or false and nothing else.
    </p>

    <h2>Cookies set by Google reCAPTCHA</h2>
    <p>
      The create account, forgot password, and request new verification link
      pages include Google reCAPTCHA, which protects the site's forms from
      automated programs. Google's script loads only after you choose to load
      reCAPTCHA on one of those pages. It then sets its own cookie,{" "}
      <code>_GRECAPTCHA</code>, on Google's domain, for its risk analysis, and
      it may also keep information in your browser's local and session storage.
      Once loaded, Google's script keeps running until you reload the page,
      close the tab, or leave the site. Moving to another page of this site does
      not stop it by itself. The site asks again before showing reCAPTCHA on
      another form. This site does not read that cookie or that storage. Google
      describes the cookie in its{" "}
      <a href={RECAPTCHA_FAQ_URL} target="_blank" rel="noopener noreferrer">
        reCAPTCHA questions and answers
      </a>
      . The <Link href={PRIVACY_NOTICE.href}>{PRIVACY_NOTICE.title}</Link>{" "}
      explains what else reCAPTCHA collects and how Google may use it.
    </p>

    <h2>Controlling cookies</h2>
    <p>
      You can delete or block cookies in your browser's settings; each browser's
      help pages explain how. If you block the session cookies you will not be
      able to stay signed in, and if you block the preference cookie, animations
      will play on each visit. The site's own code does not use local storage or
      any other way of keeping information in your browser; only reCAPTCHA, once
      you choose to load it, may.
    </p>
  </Notice>
);

export default CookieNotice;
