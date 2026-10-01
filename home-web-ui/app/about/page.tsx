import { NOTICES } from "@/app/about/notices";
import ContactEmail from "@/app/components/ContactEmail";
import { pageMetadata } from "@/app/lib/metadata";
import Link from "next/link";

export const metadata = pageMetadata("about");

const About = () => (
  <div className="flex max-w-160 flex-col gap-4 p-5">
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
        Questions about the site or any of these notices can be emailed to Ben
        at <ContactEmail />.
      </p>
    </section>
  </div>
);

export default About;
