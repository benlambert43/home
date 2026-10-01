import { RECAPTCHA_FAQ_URL } from "@/app/about/links";
import Notice from "@/app/about/Notice";
import { ACCOUNTS_AND_EMAIL, COOKIE_NOTICE } from "@/app/about/notices";
import ContactEmail from "@/app/components/ContactEmail";
import { pageMetadata } from "@/app/lib/metadata";
import Link from "next/link";

export const metadata = pageMetadata("privacy notice");

const CLOUD_DATA_PROCESSING_ADDENDUM_URL =
  "https://cloud.google.com/terms/data-processing-addendum";

const PrivacyNotice = () => (
  <Notice title="Privacy Notice" updated="2026-09-30">
    <p>
      benlambert.tech is the personal website of Ben Lambert. This notice
      explains what information the site collects, why it collects it, who else
      handles it, and the choices you have.
    </p>

    <h2>Who is responsible</h2>
    <p>
      Ben Lambert runs this site as an individual, not a company, and is
      responsible for the information described here. The site is operated from
      Denver, Colorado, in the United States, and the information it holds is
      stored and handled there. If you use the site from another country, your
      information is transferred to the United States, where privacy law may
      differ from the law where you live. To ask a question or make a request
      about your information, email Ben at <ContactEmail />.
    </p>

    <h2>Visiting without an account</h2>
    <p>
      You can read everything public on this site without an account. The site
      does not use analytics, advertising, or tracking scripts of any kind.
      Opening the home page sets one short-lived cookie that records only that
      its header animation has played, and using the control that pauses
      animations sets another; both are described in the{" "}
      <Link href={COOKIE_NOTICE.href}>{COOKIE_NOTICE.title}</Link>. The
      site&apos;s own server logs are designed to record errors, such as which
      request failed and why, and not who made the request. The infrastructure
      that hosts the site may keep standard, short-lived technical logs, such as
      IP addresses and request times, for security and reliability.
    </p>

    <h2>Creating an account</h2>
    <p>
      When you create an account, the site asks for your first name, last name,
      email address, and a password. It also gives you a random username, which
      you can change at any time, and records when the account was created and
      last modified, whether your email address has been verified, whether the
      account is an administrator account, and whether it has been suspended.
    </p>
    <p>
      Your password is stored only as a bcrypt hash, so the site cannot read it,
      and no one at the site will ever ask you for it. Your name and email
      address are meant to be shown only to you, on your profile page. Ben, who
      runs the site and its database, is the only other person who can see your
      account information. Your username is shown publicly only as the author of
      blog posts you have written, and only the site&apos;s administrator can
      publish posts.
    </p>
    <p>
      This information is used to provide your account: to sign you in, to
      verify that the email address is yours, to send you a password reset link
      when you ask for one, and to show you notifications inside the site.
    </p>

    <h2>Email</h2>
    <p>
      The site sends two kinds of email, and only when they are needed: a link
      to verify your email address after you create an account, and a link to
      choose a new password when you request one. It sends no newsletters or
      marketing email. The{" "}
      <Link href={ACCOUNTS_AND_EMAIL.href}>{ACCOUNTS_AND_EMAIL.title}</Link>{" "}
      notice describes each message.
    </p>
    <p>
      Email is sent through Gmail, a Google service, so Google handles your
      email address and the contents of each message as the mail provider. The
      site also keeps a record of each message it sends: your email address,
      when it was sent, a hashed copy of the code in the link, whether the link
      was used, and the delivery result reported by the mail provider. These
      records exist to troubleshoot email delivery and contain nothing that can
      be used to sign in.
    </p>

    <h2>reCAPTCHA</h2>
    <p>
      To keep automated programs from creating accounts and requesting email,
      the create account, forgot password, and request new verification link
      pages include Google reCAPTCHA. Google&apos;s script is loaded only when
      you choose to load it on one of those pages, and that choice is your
      consent to it. It may collect information about your browser and device,
      your IP address, and how you interact with the page, and it sets a cookie,
      in order to decide whether you are a person. When you submit one of those
      forms, the site sends your reCAPTCHA response to Google to check it, uses
      the answer only to accept or refuse the form, and does not keep it.
    </p>
    <p>
      Google provides reCAPTCHA to this site as a service provider. Ben is
      responsible for the information reCAPTCHA collects here, and Google
      handles it on the site&apos;s behalf under its{" "}
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

    <h2>Who else handles your information</h2>
    <p>
      The site does not sell, rent, or trade your information, and shares it
      only with the services that make the site work:
    </p>
    <ul>
      <li>
        Google, which checks reCAPTCHA responses and delivers the site&apos;s
        email.
      </li>
      <li>
        The hosting providers that run the site&apos;s servers and database.
      </li>
    </ul>
    <p>
      Information may also be disclosed if the law requires it, or to protect
      the site and the people who use it.
    </p>

    <h2>How long information is kept</h2>
    <p>
      Your account details and notifications are kept until you delete your
      account. Deleting your account is designed to remove them straight away,
      and to scrub your email address out of the site&apos;s records of the
      verification and password reset emails it sent you, including the delivery
      reports from the mail provider, replacing it with a random placeholder.
      Those records are kept to troubleshoot email delivery, but once your
      account is gone they are meant to show only when each email was sent and
      whether it was delivered, and nothing that connects them to you. The
      cookies the site sets, and how long each lasts, are listed in the{" "}
      <Link href={COOKIE_NOTICE.href}>{COOKIE_NOTICE.title}</Link>.
    </p>

    <h2>Your choices and rights</h2>
    <ul>
      <li>
        You can see the information on your account on your{" "}
        <Link href="/profile">profile</Link> and{" "}
        <Link href="/settings">settings</Link> pages.
      </li>
      <li>
        You can change your username on the settings page and your password on
        your profile page. To correct your name or email address, contact Ben.
      </li>
      <li>
        You can delete your account from your profile page. Deletion is
        immediate and permanent, and is designed to remove everything the site
        holds that identifies you. If you think something was missed, contact
        Ben to have it removed.
      </li>
      <li>
        You can ask for a copy of the information the site holds about you, in a
        format you can take to another service, ask for it to be corrected or
        deleted, ask for its use to be restricted, or object to how it is used,
        by contacting Ben.
      </li>
      <li>
        reCAPTCHA loads only with your consent. You can withdraw that consent by
        leaving or reloading the page, which stops Google&apos;s script, and by
        deleting its cookie in your browser. It is not loaded again unless you
        choose it.
      </li>
    </ul>
    <p>
      If you are in the European Economic Area, the United Kingdom, or another
      place with data protection law, you also have the right to complain to
      your local data protection authority. In those places, the legal bases for
      handling your information are that it is needed to provide the account you
      asked for, the site&apos;s legitimate interest in keeping the site secure
      and working, and your consent for reCAPTCHA. If you are a California
      resident, the site does not sell or share your personal information, and
      you can use the choices above to know, correct, and delete it.
    </p>
    <p>
      The site does not track visitors, so it has nothing to change in response
      to a Do Not Track or Global Privacy Control signal from your browser, and
      it treats every visitor the same whether or not one is sent.
    </p>

    <h2>Security</h2>
    <p>
      Connections to the site are encrypted with HTTPS, passwords are stored as
      bcrypt hashes, and sign-in sessions use cookies that scripts on the page
      cannot read. No website can promise perfect security, and this one is
      built and maintained by one person, so please use a password you do not
      use anywhere else.
    </p>

    <h2>Children</h2>
    <p>
      This site is not directed at children under 13, and it does not knowingly
      collect information from them. If you believe a child has created an
      account, contact Ben and it will be removed.
    </p>

    <h2>Changes to this notice</h2>
    <p>
      If this notice changes, the date at the top will be updated, and changes
      that affect how your information is used will be described on this page.
    </p>
  </Notice>
);

export default PrivacyNotice;
