import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ben lambert - profile",
  description: "ben lamberts personal website 🧑‍💻",
};

const ProfileLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <div>{children}</div>;
};

export default ProfileLayout;
