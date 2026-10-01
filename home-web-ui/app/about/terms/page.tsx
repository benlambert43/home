import { GITHUB_REPOSITORY_URL, LICENSE_URL } from "@/app/about/links";
import Notice from "@/app/about/Notice";
import {
  NO_WARRANTY_ID,
  PRIVACY_NOTICE,
  SOURCE_AND_LICENSES,
} from "@/app/about/notices";
import ContactEmail from "@/app/components/ContactEmail";
import { pageMetadata } from "@/app/lib/metadata";
import Link from "next/link";

export const metadata = pageMetadata("terms of use");

const TermsOfUse = () => (
  <Notice title="Terms of Use" updated="2026-09-30">
    <p>
      benlambert.tech is the personal website of Ben Lambert, who builds and
      runs it alone, as an individual and not a company. These terms apply to
      everyone who uses the site and to holding an account on it. By using the
      site you agree to them; if you do not agree, please do not use the site.
      How the site handles your information is described in the{" "}
      <Link href={PRIVACY_NOTICE.href}>{PRIVACY_NOTICE.title}</Link>.
    </p>

    <h2>Using the site</h2>
    <p>The site&apos;s content is there for you to read. Please do not:</p>
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
        with your account, and no one at the site will ever ask you for your
        password.
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
        Ben may suspend or delete an account that breaks these terms or that
        appears to be abusive or automated. You may delete your own account at
        any time from your <Link href="/profile">profile</Link> page.
      </li>
    </ul>

    <h2>Content and copyright</h2>
    <p>
      Unless something says otherwise, the writing, photographs, and other
      content on this site belong to Ben Lambert. You are welcome to link to any
      page and to quote short excerpts with credit, but please ask before
      republishing anything in full. The source code of the site is published on{" "}
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
      the code, not the site&apos;s content.{" "}
      <Link href={SOURCE_AND_LICENSES.href}>{SOURCE_AND_LICENSES.title}</Link>{" "}
      has the details.
    </p>

    <h2>Other services and links</h2>
    <p>
      Google reCAPTCHA protects some of the site&apos;s forms. Google provides
      it to this site as a service, and the{" "}
      <Link href={PRIVACY_NOTICE.href}>{PRIVACY_NOTICE.title}</Link> explains
      what it collects. The site links to other websites, such as GitHub. Those
      sites have their own terms and privacy practices, and this site is not
      responsible for them.
    </p>

    <h2 id={NO_WARRANTY_ID} className="scroll-mt-28">
      No warranty
    </h2>
    <p>
      This is a personal site, built and run by one person and not by a company,
      and it is offered as it is and as it is available. It may change, break,
      or go offline at any time without notice, and nothing on it is
      professional advice.
    </p>
    <p>
      The site&apos;s notices describe how it is meant to work, and Ben keeps
      them accurate on a best-effort basis. Software has bugs, though, and code
      written in error can have consequences nobody intended, so the site may
      not always behave as the notices describe. If you find that it does not,
      please email Ben at <ContactEmail />, who will do what is reasonably
      possible to put it right.
    </p>
    <p>
      To the fullest extent the law allows, the site is provided without
      warranties of any kind, whether express or implied.
    </p>

    <h2>Limitation of liability</h2>
    <p>
      To the fullest extent the law allows, Ben Lambert is not liable for any
      loss or damage arising from your use of the site or your inability to use
      it, including loss or damage caused by software bugs, mistakes in the
      code, or other unintended consequences of how the site was built. Nothing
      in these terms limits liability that cannot be limited by law.
    </p>

    <h2>Changes</h2>
    <p>
      These terms may change. The date at the top shows when they last did, and
      using the site after a change means you accept the new terms.
    </p>

    <h2>Governing law</h2>
    <p>
      These terms are governed by the laws of the State of Colorado, and any
      dispute about them or about the site will be heard in the state or federal
      courts located in Denver, Colorado.
    </p>

    <h2>Contact</h2>
    <p>
      Questions about these terms can be emailed to Ben at <ContactEmail />.
    </p>
  </Notice>
);

export default TermsOfUse;
