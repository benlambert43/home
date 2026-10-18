import { GITHUB_REPOSITORY_URL } from "@/app/about/links";
import { NOTICES } from "@/app/about/notices";
import SubtleLink from "@/app/ui/SubtleLink";

const sourceCommit = process.env.NEXT_PUBLIC_SOURCE_COMMIT ?? "";

const SOURCE_COMMIT = /^[0-9a-f]{7,40}$/.test(sourceCommit)
  ? sourceCommit
  : "source";

const footerFirstLine = [
  ...NOTICES,
  {
    href: `${GITHUB_REPOSITORY_URL}/commit/${SOURCE_COMMIT}`,
    title: `${SOURCE_COMMIT.slice(0, 7)}`,
    description: "Source commit currently deployed",
    external: true,
  },
];

const Footer = () => (
  <footer
    className="mx-2 mt-16 flex flex-col items-center gap-3 border-t
      border-slate-700 px-4 pt-6 text-xs text-slate-400"
  >
    <nav
      aria-label="Notices"
      className="flex flex-wrap justify-center gap-x-5 gap-y-2"
    >
      {footerFirstLine.map(({ href, title, external }) => (
        <SubtleLink key={href} href={href} external={external}>
          {title}
        </SubtleLink>
      ))}
    </nav>
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
      <p>© 2026 Ben Lambert</p>
    </div>
  </footer>
);

export default Footer;
