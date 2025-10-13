import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ben lambert - create account",
  description: "ben lamberts personal website 🧑‍💻",
};

const CreateAccountLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <div>{children}</div>;
};

export default CreateAccountLayout;
