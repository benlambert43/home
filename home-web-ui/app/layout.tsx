import "@/app/globals.css";
import AnimationsPausedProvider from "@/app/components/AnimationsPausedProvider";
import AnimationsScope from "@/app/components/AnimationsScope";
import Footer from "@/app/components/Footer";
import Navbar from "@/app/components/Navbar";
import { siteMetadata, siteViewport } from "@/app/lib/metadata";
import { ReactNode } from "react";

export const metadata = siteMetadata;

export const viewport = siteViewport;

const RootLayout = ({ children }: Readonly<{ children: ReactNode }>) => (
  <html
    lang="en"
    className="min-w-site-min min-h-screen bg-slate-800 text-slate-50"
  >
    <body>
      <AnimationsPausedProvider>
        <AnimationsScope className="flex min-h-screen flex-col py-8">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AnimationsScope>
      </AnimationsPausedProvider>
    </body>
  </html>
);

export default RootLayout;
