import { GITHUB_REPOSITORY_URL, LICENSE_URL } from "@/app/about/links";
import Notice from "@/app/about/Notice";
import {
  ACCOUNTS_AND_EMAIL,
  COOKIE_NOTICE,
  NO_WARRANTY_ID,
  NOTICES,
  PRIVACY_NOTICE,
  SOURCE_AND_LICENSES,
} from "@/app/about/notices";
import ContactEmail from "@/app/components/ContactEmail";
import { pageMetadata } from "@/app/lib/metadata";
import Link from "next/link";

export const metadata = pageMetadata("terms of use");

const TermsOfUse = () => (
  <Notice title="Terms of Use" updated="2026-10-05">
    <p>
      benlambert.tech is my personal website. I, Ben Lambert, build and run it
      alone, as an individual and not a company. These terms apply to everyone
      who uses the site and to holding an account on it. By using the site you
      agree to them; if you do not agree, please do not use the site. How the
      site handles your information is described in the{" "}
      <Link href={PRIVACY_NOTICE.href}>{PRIVACY_NOTICE.title}</Link>.
    </p>

    <h2>Using the site</h2>
    <p>The site's content is there for you to read. Please do not:</p>
    <ul>
      <li>
        try to gain access to accounts, servers, or data that are not yours;
      </li>
      <li>
        interfere with the site or place an unreasonable load on it, for example
        with automated requests;
      </li>
      <li>
        create accounts or submit forms with automated programs, or bypass
        reCAPTCHA;
      </li>
      <li>use the site for anything unlawful.</li>
    </ul>

    <h2>Accounts</h2>
    <ul>
      <li>
        You must be at least 13 years old to create an account, or older if the
        law where you live requires it.
      </li>
      <li>
        Give accurate details, and keep the email address on your account one
        that you can read: it is the only way to verify your account or recover
        your password.
      </li>
      <li>
        Keep your password to yourself. You are responsible for everything done
        with your account, and I will never ask you for your password.
      </li>
      <li>
        Create one account for yourself. Do not create accounts for other people
        or pretend to be someone else.
      </li>
      <li>
        Choose a username you would be happy to see in public. The site tries to
        refuse offensive usernames.
      </li>
      <li>
        I may suspend or delete an account that breaks these terms or that
        appears to be abusive or automated. You may delete your own account at
        any time from your <Link href="/settings">settings</Link> page.
      </li>
    </ul>

    <h2>Email from the site</h2>
    <p>
      By creating an account, you agree to receive essential email from the site
      at the email address on your account. As well as the verification and
      password reset links described in{" "}
      <Link href={ACCOUNTS_AND_EMAIL.href}>{ACCOUNTS_AND_EMAIL.title}</Link>, I
      may email you:
    </p>
    <ul>
      <li>
        to tell you that one of the site's notices has been updated:
        <ul>
          {NOTICES.map(({ href, title }) => (
            <li key={href}>
              <Link href={href}>{title}</Link>
            </li>
          ))}
        </ul>
      </li>
      <li>
        with an urgent notice about your account, such as a security problem
        that affects it, or its suspension.
      </li>
    </ul>
    <p>
      These emails are part of having an account and are not marketing, so there
      is no way to unsubscribe from them while you have one. Deleting your
      account stops them. Newsletter emails and product and marketing emails are
      separate and optional: the site sends them only while you have agreed to
      receive them, and you can change that choice at any time on your{" "}
      <Link href="/settings">settings</Link> page.
    </p>

    <h2>Content and copyright</h2>
    <p>
      Unless something says otherwise, the writing, photographs, and other
      content on this site belong to me. You are welcome to link to any page and
      to quote short excerpts with credit, but please ask before republishing
      anything in full. The source code of the site is published on{" "}
      <a href={GITHUB_REPOSITORY_URL} target="_blank" rel="noopener noreferrer">
        GitHub
      </a>{" "}
      under the{" "}
      <a href={LICENSE_URL} target="_blank" rel="noopener noreferrer">
        GNU Affero General Public License, version 3 or later
      </a>
      , which lets anyone read it, learn from it, change it, and use it for any
      purpose, as long as they share their own changes under the same license
      when they distribute the code or run it as a service. The license covers
      the code, not the site's content.{" "}
      <Link href={SOURCE_AND_LICENSES.href}>{SOURCE_AND_LICENSES.title}</Link>{" "}
      has the details.
    </p>

    <h2>Other services and links</h2>
    <p>
      Google reCAPTCHA protects some of the site's forms. Google provides it to
      this site as a service, and the{" "}
      <Link href={PRIVACY_NOTICE.href}>{PRIVACY_NOTICE.title}</Link> explains
      what it collects. The site links to other websites, such as GitHub. Those
      sites have their own terms and privacy practices, and this site is not
      responsible for them.
    </p>

    <h2>Paying for the site</h2>
    <p>
      Today the site is free to use, shows no advertising, and sells nothing,
      and I pay for its hosting myself. To help cover that cost, I may in the
      future do any of the following, all of them, or none of them:
    </p>
    <ul>
      <li>show advertising;</li>
      <li>publish sponsored posts, each prominently labeled as sponsored;</li>
      <li>offer products or services for sale;</li>
      <li>add a part of the site that only paying members can use.</li>
    </ul>
    <p>
      Before any of these begins, these terms will be updated to describe it,
      and so will the{" "}
      <Link href={PRIVACY_NOTICE.href}>{PRIVACY_NOTICE.title}</Link> and{" "}
      <Link href={COOKIE_NOTICE.href}>{COOKIE_NOTICE.title}</Link> if it changes
      how the site handles your information or which cookies it sets. Anything
      that costs money will show its price and its terms before you pay, and
      having an account will not, by itself, commit you to paying for anything.
    </p>

    <h2 id={NO_WARRANTY_ID} className="scroll-mt-28">
      No warranty
    </h2>
    <p>
      This is my personal site, built and run by me alone and not by a company,
      and it is offered as it is and as it is available. It may change, break,
      or go offline at any time without notice, and nothing on it is
      professional advice.
    </p>
    <p>
      The site's notices describe how it is meant to work, and I keep them
      accurate on a best-effort basis. Software has bugs, though, and code
      written in error can have consequences nobody intended, so the site may
      not always behave as the notices describe. If you find that it does not,
      please email me at <ContactEmail />, and I will do what is reasonably
      possible to put it right.
    </p>
    <p>
      To the fullest extent the law allows, the site is provided without
      warranties of any kind, whether express or implied.
    </p>

    <h2>Limitation of liability</h2>
    <p>
      To the fullest extent the law allows, I am not liable for any loss or
      damage arising from your use of the site or your inability to use it,
      including loss or damage caused by software bugs, mistakes in the code, or
      other unintended consequences of how the site was built. Nothing in these
      terms limits liability that cannot be limited by law.
    </p>

    <h2>Changes</h2>
    <p>
      These terms may change. The date at the top shows when they last did, and
      using the site after a change means you accept the new terms. If you have
      an account, I may also email you about a change.
    </p>

    <h2>Governing law</h2>
    <p>
      These terms are governed by the laws of the State of Colorado, and any
      dispute about them or about the site will be heard in the state or federal
      courts located in Denver, Colorado.
    </p>

    <h2>Contact</h2>
    <p>
      If you have questions about these terms, email me at <ContactEmail />.
    </p>
  </Notice>
);

export default TermsOfUse;
