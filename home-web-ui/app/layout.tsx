import "@/app/globals.css";
import Navbar from "@/app/components/Navbar";
import { siteMetadata } from "@/app/lib/metadata";
import { ReactNode } from "react";

export const metadata = siteMetadata;

const RootLayout = ({ children }: Readonly<{ children: ReactNode }>) => (
  <html
    lang="en"
    className="min-w-site-min min-h-screen bg-slate-800 text-slate-50"
  >
    <body>
      <div className="py-8">
        <Navbar />
        {children}
      </div>
    </body>
  </html>
);

export default RootLayout;
