import Link from "next/link";

const Navbar = () => {
  return (
    <div
      className="justify-left flex min-w-full flex-wrap items-center gap-4
        rounded-xl bg-slate-600 px-6 py-4"
    >
      <Link href="/">benlambert.tech</Link>
      <Link href="/blog">blog</Link>
      <Link href="/projects">projects</Link>
      <Link href="/about">about</Link>
    </div>
  );
};

export default Navbar;
