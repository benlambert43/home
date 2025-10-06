import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "Home",
  description: "ben lamberts personal website 🧑‍💻",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <body>
        <div>
          <Navbar />
          <div>{children}</div>
        </div>
      </body>
    </html>
  );
};

export default RootLayout;
