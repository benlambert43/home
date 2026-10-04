import { NOTICES } from "@/app/about/notices";
import ContactEmail from "@/app/components/ContactEmail";
import PageColumn from "@/app/components/PageColumn";
import { pageMetadata } from "@/app/lib/metadata";
import Link from "next/link";

export const metadata = pageMetadata("about");

const About = () => (
  <PageColumn className="flex flex-col gap-4">
    <h1 className="text-4xl font-bold">About</h1>
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold">Notices</h2>
      <p>
        Legal, privacy, and licensing information about this website, your
        account, and the email address you give it.
      </p>
      <ul className="flex flex-col gap-3">
        {NOTICES.map(({ href, title, description }) => (
          <li key={href}>
            <Link href={href} className="underline">
              {title}
            </Link>
            <p className="text-sm text-slate-400">{description}</p>
          </li>
        ))}
      </ul>
    </section>
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold">Contact</h2>
      <p>
        If you have questions about the site or any of these notices, email me
        at <ContactEmail />.
      </p>
    </section>
  </PageColumn>
);

export default About;
