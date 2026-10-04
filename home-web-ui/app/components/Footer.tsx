import { NOTICES } from "@/app/about/notices";
import SubtleLink from "@/app/ui/SubtleLink";

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
        <SubtleLink key={href} href={href}>
          {title}
        </SubtleLink>
      ))}
    </nav>
    <p>© 2026 Ben Lambert</p>
  </footer>
);

export default Footer;
