import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ben lambert - blog",
  description: "ben lamberts personal website 🧑‍💻",
};

const BlogLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <div>{children}</div>;
};

export default BlogLayout;
