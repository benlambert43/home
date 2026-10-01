import { GITHUB_REPOSITORY_URL, LICENSE_URL } from "@/app/about/links";
import Notice from "@/app/about/Notice";
import { TERMS_OF_USE } from "@/app/about/notices";
import ContactEmail from "@/app/components/ContactEmail";
import { pageMetadata } from "@/app/lib/metadata";
import Link from "next/link";

export const metadata = pageMetadata("source and licenses");

const PACKAGE_FILE_URL = `${GITHUB_REPOSITORY_URL}/blob/main/package.json`;

const OPEN_SOURCE_PROJECTS = [
  {
    name: "Next.js",
    license: "MIT License",
    copyright: "Copyright (c) 2025 Vercel, Inc.",
    href: "https://github.com/vercel/next.js/blob/canary/license.md",
  },
  {
    name: "React, React DOM, and Scheduler",
    license: "MIT License",
    copyright: "Copyright (c) Meta Platforms, Inc. and affiliates.",
    href: "https://github.com/react/react/blob/main/LICENSE",
  },
  {
    name: "Tailwind CSS",
    license: "MIT License",
    copyright: "Copyright (c) Tailwind Labs, Inc.",
    href: "https://github.com/tailwindlabs/tailwindcss/blob/main/LICENSE",
  },
  {
    name: "Tailwind CSS Typography",
    license: "MIT License",
    copyright: "Copyright (c) Tailwind Labs, Inc.",
    href: "https://github.com/tailwindlabs/tailwindcss-typography/blob/main/LICENSE",
  },
  {
    name: "Heroicons",
    license: "MIT License",
    copyright: "Copyright (c) Tailwind Labs, Inc.",
    href: "https://github.com/tailwindlabs/heroicons/blob/master/LICENSE",
  },
  {
    name: "Marked",
    license: "MIT License",
    copyright:
      "Copyright (c) 2018+, MarkedJS. Copyright (c) 2011-2018, Christopher Jeffrey.",
    href: "https://github.com/markedjs/marked/blob/master/LICENSE",
  },
  {
    name: "marked-react",
    license: "MIT License",
    copyright: "Copyright (c) 2021 Sibiraj.",
    href: "https://github.com/sibiraj-s/marked-react/blob/master/LICENSE",
  },
  {
    name: "Zod",
    license: "MIT License",
    copyright: "Copyright (c) 2025 Colin McDonnell.",
    href: "https://github.com/colinhacks/zod/blob/main/LICENSE",
  },
  {
    name: "react-google-recaptcha",
    license: "MIT License",
    copyright: "Copyright (c) 2015 Hugo Dozois.",
    href: "https://github.com/dozoisch/react-google-recaptcha/blob/master/LICENSE",
  },
  {
    name: "react-async-script",
    license: "MIT License",
    copyright: "Copyright (c) 2017 Hugo Dozois.",
    href: "https://github.com/dozoisch/react-async-script/blob/master/LICENSE",
  },
  {
    name: "prop-types",
    license: "MIT License",
    copyright: "Copyright (c) 2013-present, Facebook, Inc.",
    href: "https://github.com/facebook/prop-types/blob/main/LICENSE",
  },
  {
    name: "hoist-non-react-statics",
    license: "BSD 3-Clause License",
    copyright: "Copyright (c) 2015, Yahoo! Inc. All rights reserved.",
    href: "https://github.com/mridgway/hoist-non-react-statics/blob/main/LICENSE.md",
  },
  {
    name: "SWC helpers",
    license: "Apache License 2.0",
    copyright: "Copyright 2024 SWC contributors.",
    href: "https://github.com/swc-project/swc/blob/main/LICENSE",
  },
];

const SourceAndLicenses = () => (
  <Notice title="Source and Licenses" updated="2026-09-30">
    <p>
      benlambert.tech is open source. This page explains how the site&apos;s own
      code is licensed, what the license does not cover, and which open-source
      software the site is built with.
    </p>

    <h2>This site&apos;s source code</h2>
    <p>
      The source code is published on{" "}
      <a href={GITHUB_REPOSITORY_URL} target="_blank" rel="noopener noreferrer">
        GitHub
      </a>
      . Copyright (C) 2026 Ben Lambert. It is licensed under the{" "}
      <a href={LICENSE_URL} target="_blank" rel="noopener noreferrer">
        GNU Affero General Public License, version 3 or later
      </a>
      , which lets anyone read it, learn from it, change it, and use it for any
      purpose, as long as they share their own changes under the same license
      when they distribute the code or run it as a service. The code comes with
      no warranty.
    </p>

    <h2>What the license does not cover</h2>
    <p>
      The license covers the code, not the site&apos;s content. The writing,
      photographs, and other images on this site, including the image files kept
      in the repository, belong to Ben Lambert and are not licensed under it.
      The <Link href={TERMS_OF_USE.href}>{TERMS_OF_USE.title}</Link> explain how
      they may be used.
    </p>

    <h2>Open-source software in this site</h2>
    <p>
      The pages this site sends to your browser are built with the open-source
      projects below, used under their own licenses. Each name links to that
      project&apos;s license, which holds its full copyright and permission
      notice.
    </p>
    <ul>
      {OPEN_SOURCE_PROJECTS.map(({ name, license, copyright, href }) => (
        <li key={name}>
          <a href={href} target="_blank" rel="noopener noreferrer">
            {name}
          </a>
          : {license}. {copyright}
        </li>
      ))}
    </ul>
    <p>
      The site&apos;s server uses further open-source packages that are not sent
      to your browser. Every dependency is listed in the{" "}
      <a href={PACKAGE_FILE_URL} target="_blank" rel="noopener noreferrer">
        package files
      </a>{" "}
      in the repository. This list is kept up to date on a best-effort basis, so
      if a project is missing or credited incorrectly, please email Ben at{" "}
      <ContactEmail /> so it can be corrected.
    </p>
  </Notice>
);

export default SourceAndLicenses;
