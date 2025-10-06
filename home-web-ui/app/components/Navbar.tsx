import Link from "next/link";

const Navbar = () => {
  return (
    <div className="flex justify-left items-center gap-4 bg-slate-600 min-w-full rounded-xl py-4 px-6">
      <Link href="/">benlambert.tech</Link>
      <Link href="/blog">blog</Link>
      <Link href="/projects">projects</Link>
      <Link href="/about">about</Link>
    </div>
  );
};

export default Navbar;
