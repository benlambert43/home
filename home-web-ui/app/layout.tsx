import "@/app/globals.css";
import type { Metadata } from "next";
import Navbar from "@/app/components/Navbar";

export const metadata: Metadata = {
  title: "ben lambert",
  description: "ben lamberts personal website 🧑‍💻",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html
      lang="en"
      className="min-h-screen min-w-screen bg-slate-800 text-slate-50"
    >
      <body>
        <div className="py-8">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
};

export default RootLayout;
