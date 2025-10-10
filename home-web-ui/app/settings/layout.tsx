import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ben lambert - settings",
  description: "ben lamberts personal website 🧑‍💻",
};

const SettingsLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <div>{children}</div>;
};

export default SettingsLayout;
