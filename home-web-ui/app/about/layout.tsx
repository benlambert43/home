import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ben lambert - about",
  description: "ben lamberts personal website 🧑‍💻 - about",
};

const AboutLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <div>{children}</div>;
};

export default AboutLayout;
