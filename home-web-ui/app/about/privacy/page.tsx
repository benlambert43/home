import { RECAPTCHA_FAQ_URL } from "@/app/about/links";
import Notice from "@/app/about/Notice";
import {
  ACCOUNTS_AND_EMAIL,
  COOKIE_NOTICE,
  PRIVACY_NOTICE,
  TERMS_OF_USE,
} from "@/app/about/notices";
import ContactEmail from "@/app/components/ContactEmail";
import { pageMetadata } from "@/app/lib/metadata";
import Link from "next/link";

export const metadata = pageMetadata("privacy notice", {
  canonicalPath: PRIVACY_NOTICE.href,
  description: PRIVACY_NOTICE.description,
});

const CLOUD_DATA_PROCESSING_ADDENDUM_URL =
  "https://cloud.google.com/terms/data-processing-addendum";

const CLOUDFLARE_PRIVACY_POLICY_URL =
  "https://www.cloudflare.com/privacypolicy/";

const PrivacyNotice = () => (
  <Notice title="Privacy Notice" updated="2026-10-09">
    <p>
      benlambert.tech is my personal website. This notice explains what
      information the site collects, why it collects it, who else handles it,
      and the choices you have.
    </p>

    <h2>Who is responsible</h2>
    <p>
      I, Ben Lambert, run this site as an individual, not a company, and I am
      responsible for the information described here. The site is operated from
      Denver, Colorado, in the United States, and the information it holds is
      stored and handled there. If you use the site from another country, your
      information is transferred to the United States, where privacy law may
      differ from the law where you live. To ask a question or make a request
      about your information, email me at <ContactEmail />.
    </p>

    <h2>Visiting without an account</h2>
    <p>
      You can read everything public on this site without an account. The site
      does not use advertising or tracking scripts. Analytics about how the site
      is used, such as which pages are visited and how quickly they load, may be
      collected to keep the site reliable and to maintain it, and are never sold
      or shared. Using the control that pauses animations sets one cookie, which
      records only that choice and is described in the{" "}
      <Link href={COOKIE_NOTICE.href}>{COOKIE_NOTICE.title}</Link>. The site's
      own server logs record errors, such as which request failed and why. They
      are designed not to record your IP address, your email address, or
      anything else about who made a request, although an error involving your
      account may include its account ID. The infrastructure that hosts the site
      may keep standard, short-lived technical logs, such as IP addresses and
      request times, for security and reliability.
    </p>

    <h2>Creating an account</h2>
    <p>
      When you create an account, the site asks for your first name, last name,
      email address, and a password. It asks you to agree to the{" "}
      <Link href={TERMS_OF_USE.href}>{TERMS_OF_USE.title}</Link>, which is
      required, and whether you want to receive newsletter emails and product
      and marketing emails, which are both optional. It records each answer and
      the date and time you gave it. If you later change an optional answer on
      the settings page, the new answer and its time replace the old ones. It
      also gives you a random username, which you can change at any time, and
      records when the account was created and last modified, whether your email
      address has been verified, whether the account is an administrator
      account, and whether it has been suspended.
    </p>
    <p>
      Your password is stored only as a bcrypt hash, so the site cannot read it,
      and I will never ask you for it. Your name and email address are meant to
      be shown only to you, on your profile page. I run the site and its
      database, and I am the only other person who can see your account
      information. Your username is shown publicly only as the author of blog
      posts you have written, and only I can publish posts.
    </p>
    <p>
      This information is used to provide your account: to sign you in, to
      verify that the email address is yours, to send you a password reset link
      when you ask for one, to send you the essential notices described under
      Email below, and to show you notifications inside the site.
    </p>

    <h2>Signing in</h2>
    <p>
      To slow down anyone trying to guess passwords, the site counts sign-in
      attempts for each email address entered on the{" "}
      <Link href="/signin">sign in</Link> page, whether or not an account exists
      for it. After 5 attempts in 15 minutes, it asks you to wait before trying
      again. The site keeps the email address and the count for about 15 minutes
      from the first attempt, or less if you sign in, reset your password, or
      delete your account, and uses them for nothing else.
    </p>

    <h2>Email</h2>
    <p>
      The site sends two kinds of email automatically, and only when they are
      needed: a link to verify your email address after you create an account,
      and a link to choose a new password when you request one. By creating an
      account, you also agree to receive essential notices at the email address
      on your account: I may email you when one of the site's notices, including
      this one, has been updated, or when something urgent affects your account,
      such as a security problem. Newsletter emails and product and marketing
      emails are optional: the site sends them only while you have agreed to
      receive them. The{" "}
      <Link href={ACCOUNTS_AND_EMAIL.href}>{ACCOUNTS_AND_EMAIL.title}</Link>{" "}
      notice describes each message.
    </p>
    <p>
      Email is sent through Gmail, a Google service, so Google handles your
      email address and the contents of each message as the mail provider. The
      site also keeps a record of each verification and password reset email it
      sends: which account it was for, your email address, when it was sent and
      when its link expires, a hashed copy of the code in the link, whether the
      link was used, and the delivery result reported by the mail provider.
      These records exist to troubleshoot email delivery and contain nothing
      that can be used to sign in.
    </p>

    <h2>reCAPTCHA</h2>
    <p>
      To keep automated programs from creating accounts and requesting email,
      the create account, forgot password, and request new verification link
      pages include Google reCAPTCHA. Google's script is loaded only when you
      choose to load it on one of those pages, and that choice is your consent
      to it. It may collect information about your browser and device, your IP
      address, and how you interact with the page, and it sets a cookie, in
      order to decide whether you are a person. When you submit one of those
      forms, the site sends your reCAPTCHA response to Google to check it, uses
      the answer only to accept or refuse the form, and does not keep it.
    </p>
    <p>
      Google provides reCAPTCHA to this site as a service provider. I am
      responsible for the information reCAPTCHA collects here, and Google
      handles it on the site's behalf under its{" "}
      <a
        href={CLOUD_DATA_PROCESSING_ADDENDUM_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        Cloud Data Processing Addendum
      </a>
      . Google says it uses that information only as needed to provide and
      maintain reCAPTCHA and to keep its security and threat detection
      effective. Google explains how reCAPTCHA handles this information in its{" "}
      <a href={RECAPTCHA_FAQ_URL} target="_blank" rel="noopener noreferrer">
        reCAPTCHA questions and answers
      </a>
      .
    </p>

    <h2>Cloudflare</h2>
    <p>
      Every visit to the site passes through Cloudflare, which delivers the site
      and protects it from attacks. Your connection is encrypted between your
      browser and Cloudflare. Cloudflare decrypts each request, including
      anything you enter in a form, such as your password, so that it can pass
      the request on to the site's servers over a separate encrypted connection.
      Cloudflare handles this information as a service provider and may keep
      technical logs, such as IP addresses and request times, for security and
      reliability. Cloudflare explains how it handles this information in its{" "}
      <a
        href={CLOUDFLARE_PRIVACY_POLICY_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        privacy policy
      </a>
      .
    </p>

    <h2>Who else handles your information</h2>
    <p>
      The site does not sell, rent, or trade your information, and shares it
      only with the services that make the site work:
    </p>
    <ul>
      <li>
        Google, which checks reCAPTCHA responses and delivers the site's email.
      </li>
      <li>Cloudflare, which delivers the site and protects it from attacks.</li>
      <li>Any hosting providers that run the site's servers and database.</li>
    </ul>
    <p>
      Information may also be disclosed if the law requires it, or to protect
      the site and the people who use it.
    </p>

    <h2>How long information is kept</h2>
    <p>
      Your account details, your notifications, and the site's records of the
      verification and password reset emails it sent you are kept until you
      delete your account. Deleting your account is designed to remove your
      account details and notifications straight away, and to scrub your email
      address out of those email records, including the delivery reports from
      the mail provider, replacing it with a random placeholder. The scrubbed
      records are kept to troubleshoot email delivery and have no set expiry,
      but once your account is gone they are meant to show only when each email
      was sent and whether it was delivered, and nothing that connects them to
      you. Sign-in attempt counts are deleted about 15 minutes after the first
      attempt, whether or not you have an account. The cookies the site sets,
      and how long each lasts, are listed in the{" "}
      <Link href={COOKIE_NOTICE.href}>{COOKIE_NOTICE.title}</Link>.
    </p>

    <h2>Your choices and rights</h2>
    <ul>
      <li>
        Your <Link href="/profile">profile</Link> and{" "}
        <Link href="/settings">settings</Link> pages show your name, your email
        address and whether it has been verified, your username, and your
        current choices about newsletter emails and product and marketing
        emails. To see everything else the site holds about you, ask for a copy
        as described below.
      </li>
      <li>
        You can change your username and your password from the settings page.
        To correct your name or email address, contact me.
      </li>
      <li>
        You can delete your account from your settings page. Deletion is
        immediate and permanent, and is designed to remove everything the site
        holds that identifies you. If you think something was missed, contact me
        to have it removed.
      </li>
      <li>
        You can ask for a copy of the information the site holds about you, in a
        format you can take to another service, ask for it to be corrected or
        deleted, ask for its use to be restricted, or object to how it is used,
        by contacting me.
      </li>
      <li>
        reCAPTCHA loads only with your consent. You can withdraw that consent
        when you reload the page, close the tab, or leave the site, which stops
        Google's script, and by deleting its cookie in your browser. Moving to
        another page of this site does not stop the script by itself. The site
        asks again before showing reCAPTCHA on another form.
      </li>
      <li>
        Newsletter emails and product and marketing emails are sent only with
        your consent. You can give or withdraw that consent to either one at any
        time on the settings page.
      </li>
    </ul>
    <p>
      If you are in the European Economic Area, the United Kingdom, or another
      place with data protection law, you also have the right to complain to
      your local data protection authority. In those places, the legal bases for
      handling your information are that it is needed to provide the account you
      asked for, the site's legitimate interest in keeping the site secure and
      working, and your consent for reCAPTCHA, newsletter emails, and product
      and marketing emails. If you are a California resident, the site does not
      sell or share your personal information, and you can use the choices above
      to know, correct, and delete it.
    </p>
    <p>
      The site does not track visitors across other sites or sell or share their
      information, so it has nothing to change in response to a Do Not Track or
      Global Privacy Control signal from your browser, and it treats every
      visitor the same whether or not one is sent.
    </p>

    <h2>Security</h2>
    <p>
      Connections to the site are encrypted with HTTPS, passwords are stored as
      bcrypt hashes, and sign-in sessions use cookies that scripts on the page
      cannot read. No website can promise perfect security, and I build and
      maintain this one on my own, so please use a password you do not use
      anywhere else.
    </p>

    <h2>Children</h2>
    <p>
      This site is not directed at children under 13, and it does not knowingly
      collect information from them. If you believe a child has created an
      account, contact me and it will be removed.
    </p>

    <h2>Changes to this notice</h2>
    <p>
      If this notice changes, the date at the top will be updated, and changes
      that affect how your information is used will be described on this page.
      If you have an account, I may also email you about a change.
    </p>
  </Notice>
);

export default PrivacyNotice;
