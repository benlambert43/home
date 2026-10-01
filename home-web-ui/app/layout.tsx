import "@/app/globals.css";
import Footer from "@/app/components/Footer";
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
      <div className="flex min-h-screen flex-col py-8">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
    </body>
  </html>
);

export default RootLayout;
