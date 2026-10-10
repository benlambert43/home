import { GITHUB_REPOSITORY_URL } from "@/app/about/links";
import { NOTICES } from "@/app/about/notices";
import SubtleLink from "@/app/ui/SubtleLink";

const sourceCommit = process.env.NEXT_PUBLIC_SOURCE_COMMIT ?? "";

const SOURCE_COMMIT = /^[0-9a-f]{7,40}$/.test(sourceCommit)
  ? sourceCommit
  : undefined;

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
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
      <p>© 2026 Ben Lambert</p>
      {SOURCE_COMMIT && (
        <SubtleLink
          href={`${GITHUB_REPOSITORY_URL}/commit/${SOURCE_COMMIT}`}
          external
        >
          {SOURCE_COMMIT.slice(0, 7)}
        </SubtleLink>
      )}
    </div>
  </footer>
);

export default Footer;
