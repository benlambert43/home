import Notice from "@/app/about/Notice";
import { NOTICES, PRIVACY_NOTICE, TERMS_OF_USE } from "@/app/about/notices";
import ContactEmail from "@/app/components/ContactEmail";
import { pageMetadata } from "@/app/lib/metadata";
import Link from "next/link";

export const metadata = pageMetadata("accounts and email");

const AccountsAndEmail = () => (
  <Notice title="Accounts and Email" updated="2026-10-05">
    <p>
      This page explains what happens when you create an account on
      benlambert.tech, which emails the site sends, and how to change or delete
      your account. The{" "}
      <Link href={PRIVACY_NOTICE.href}>{PRIVACY_NOTICE.title}</Link> explains
      what the site does with your information; this page is about the
      mechanics.
    </p>

    <h2>Creating an account</h2>
    <p>
      The <Link href="/createaccount">create account</Link> page asks for your
      first name, last name, email address, and a password of at least 8
      characters, and asks you to complete a reCAPTCHA. It also has three
      checkboxes. Agreeing to the{" "}
      <Link href={TERMS_OF_USE.href}>{TERMS_OF_USE.title}</Link> is required.
      Receiving newsletter emails and receiving product and marketing emails are
      both optional, and you can create an account without ticking either. Each
      email address can have one account. The site then gives you a random
      username and signs you in.
    </p>
    <p>
      You can change your username on the <Link href="/settings">settings</Link>{" "}
      page. A username is 2 to 30 characters of letters, numbers, dashes, and
      underscores, must not already be taken, and must not be offensive.
    </p>

    <h2>Verifying your email address</h2>
    <p>
      Right after you create an account, the site emails you a verification
      link. The link works for 10 minutes. Until you use it, a notification on
      the site reminds you to check your inbox, and your{" "}
      <Link href="/profile">profile</Link> page shows the address as not yet
      verified.
    </p>
    <p>
      If the link expires, or the email never arrives, check your spam and junk
      folders, then request a new link from your profile page. Requesting a new
      link also asks for a reCAPTCHA. The site sends one link at a time, so it
      will ask you to wait until the previous link has expired before sending
      another.
    </p>

    <h2>Resetting your password</h2>
    <p>
      If you forget your password, the{" "}
      <Link href="/forgotpassword">forgot password</Link> page asks for your
      email address and a reCAPTCHA, and emails you a link to choose a new
      password. The link works for 15 minutes, and only one link is active at a
      time. The page shows the same message whether or not an account exists for
      the address, so that it does not reveal who has an account. If you did not
      ask for a reset, ignore the email: your password does not change unless
      the link is used.
    </p>

    <h2>The emails this site sends</h2>
    <p>
      The site is designed to send two emails automatically, both described
      above: an email verification link and a password reset link. Each is the
      result of creating an account or asking for a link. Both are plain text,
      come from a Gmail address, and have a subject line that starts with{" "}
      <em>benlambert dot tech</em>.
    </p>
    <p>
      By creating an account, you also agree to receive essential notices at the
      email address on your account. I may send you one:
    </p>
    <ul>
      <li>
        when one of the site&apos;s notices has been updated:
        <ul>
          {NOTICES.map(({ href, title }) => (
            <li key={href}>
              <Link href={href}>{title}</Link>
            </li>
          ))}
        </ul>
      </li>
      <li>
        when something urgent affects your account, such as a security problem
        or a suspension.
      </li>
    </ul>
    <p>
      These notices are part of having an account, so there is no way to
      unsubscribe from them while you have one. Deleting your account stops
      them.
    </p>
    <p>
      Newsletter emails and product and marketing emails are optional. The site
      sends them only while their checkboxes are ticked on your{" "}
      <Link href="/settings">settings</Link> page, which start out as you left
      them when you created your account.
    </p>
    <p>
      No email from this site asks you for your password or any other details,
      so treat any email that does as suspicious.
    </p>

    <h2>Signing in and staying signed in</h2>
    <p>
      The <Link href="/signin">sign in</Link> page allows 5 attempts for an
      email address in 15 minutes, then asks you to wait before trying again. A
      successful sign-in clears the count, and so does resetting your password,
      which also ends the wait.
    </p>
    <p>
      Signing in keeps you signed in on that browser for 7 days, after which you
      sign in again. Changing your username, password, or optional email choices
      on that browser starts the 7 days over. Logging out from your profile page
      ends the session on that browser straight away.
    </p>

    <h2>Changing your details</h2>
    <ul>
      <li>Username: the settings page.</li>
      <li>
        Password: the settings page, which asks for your current password first.
      </li>
      <li>
        First name, last name, and email address: these cannot be changed on the
        site yet. Email me at <ContactEmail /> to have them corrected.
      </li>
      <li>
        Newsletter emails and product and marketing emails: the settings page.
        Tick or untick either checkbox, then choose Save.
      </li>
    </ul>

    <h2>Deleting your account</h2>
    <p>
      Open your settings page, choose Delete Account, and confirm. Deletion
      happens immediately and cannot be undone. It is designed to remove your
      name, email address, username, password, notifications, and any count of
      recent sign-in attempts, and to scrub your email address out of the
      site&apos;s records of the emails it sent you, so that nothing that
      identifies you is left behind. If you think something was missed, email me
      at <ContactEmail /> to have it removed.
    </p>
  </Notice>
);

export default AccountsAndEmail;
