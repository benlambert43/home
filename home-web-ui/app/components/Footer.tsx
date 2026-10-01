import { NOTICES } from "@/app/about/notices";
import Link from "next/link";

const FOOTER_LINK_CLASSES =
  "underline decoration-transparent decoration-1 underline-offset-4 transition-colors duration-200 ease-out hover:text-slate-200 hover:decoration-slate-200/50 focus-visible:text-slate-200 focus-visible:decoration-slate-200/50";

const Footer = () => (
  <footer
    className="mx-2 mt-16 flex flex-col items-center gap-3 border-t
      border-slate-700 px-4 pt-6 text-xs text-slate-400"
  >
    <nav
      aria-label="Notices"
      className="flex flex-wrap justify-center gap-x-5 gap-y-2"
    >
      {NOTICES.map(({ href, title }) => (
        <Link key={href} href={href} className={FOOTER_LINK_CLASSES}>
          {title}
        </Link>
      ))}
    </nav>
    <p>© 2026 Ben Lambert</p>
  </footer>
);

export default Footer;
