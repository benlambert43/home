import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ben lambert - projects",
  description: "ben lamberts personal website 🧑‍💻",
};

const ProjectsLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <div>{children}</div>;
};

export default ProjectsLayout;
