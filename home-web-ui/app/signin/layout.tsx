import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ben lambert - sign in",
  description: "ben lamberts personal website 🧑‍💻",
};

const SignInLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <div>{children}</div>;
};

export default SignInLayout;
