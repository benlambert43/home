# home-web-ui

The Next.js site. It sits in front of `home-server` as a backend-for-frontend:
server actions hold the API session cookie and make the API calls, so the
browser never talks to the API. Route handlers under `/blog` proxy image
traffic that has to stream; the upload route checks the admin session and the
`Origin` header itself, because route handlers do not get the CSRF protection
that server actions have.

Signing in sets two `httpOnly` cookies: `apisession`, the API's JWT, which
actions send as the `Authorization` header, and `bffsession`, a JWT signed with
`BFF_SESSION_SECRET` that carries the user and is what pages read. The browser
asks `/session` whether it is signed in and an admin.

`.env.template` lists the environment: `BASE_API_URL`, `BASE_SITE_URL`,
`BFF_SESSION_SECRET`, `NEXT_PUBLIC_CAPTCHA_PUBLIC` and `REVALIDATE_SECRET`.
Every one is required. The Dockerfile also sets `NEXT_PUBLIC_SOURCE_COMMIT`
from its `SOURCE_COMMIT` build argument, and the footer links to that commit on
GitHub. It is optional and inlined by `next build`, so the footer shows no
commit in development or when the build had none.

## Development

```bash
npm run dev
```

Serves on [localhost:3000](http://localhost:3000). This workspace's script does
not build `home-shared`; `npm run dev` from the repository root does.

`npm test` runs Vitest with jsdom and Testing Library. Tests sit next to the
code they cover as `*.test.ts` and `*.test.tsx` files.

## Post images

Post images come from the API's `large` thumbnail, which the site treats as the
full-size original, and `next/image` makes every smaller size from it. The API's
`medium` and `small` thumbnails are for other clients. The upload itself is only
a link target: clicking a post image opens it in a new tab.

## Post editor

`/blog/newPost` and `/blog/<slug>/edit` use the editor in `app/blog/aquariusEditor`:
a Tiptap (ProseMirror) document behind a Word 97 style chrome. Formatting
shows as it is typed, so `**bold**`, `# `, `- `, `> ` and ` ` ``` become
bold text, a heading, a list, a quote and a code block, and plain text pasted
into the document is read as Markdown. Links, tables, images and line breaks
come from the Insert menu, and double-clicking an image sets its description.
The editor renders only in the browser; both pages are already dynamic (see
Static pages in the root README).

`postMarkdown.ts` defines how the document reads and writes a post's Markdown
through `@tiptap/markdown`, which parses with `marked` like `home-shared`, and
keeps the output inside the rules `disallowedPostMarkdown` enforces: text is
backslash-escaped rather than HTML-encoded, so excerpts and heading ids see the
real characters; a paragraph line that would otherwise start a block (`#`, `-`,
`1.`, `>`, `---`) is escaped; a hard break is a trailing backslash; images are
inline nodes written as `![alt](./images/<name>)` and shown with `next/image`
from the form's image list; a table cell holds one paragraph, and a line break
inside one becomes a space, since GFM cells are single lines; a code fence is
longer than any backtick run inside the block. The form submits the Markdown in
a hidden `content` field. Until the document changes, the field keeps the
content the page loaded, so an untouched post is submitted byte for byte and
the unsaved-changes warning stays quiet.

## Production build

`next.config.ts` sets `output: "standalone"` and `cacheComponents: true`, and
adds the security headers and Content Security Policy. Next keeps the
repository layout in the standalone output, so the entrypoint is
`.next/standalone/home-web-ui/server.js`, not `.next/standalone/server.js`.

```bash
PORT=3001 npm run start
```

The standalone output leaves out `public` and `.next/static`, so the script
copies both into it before starting the server. `next start` does not work with
standalone output. The server takes its port from `PORT` (default 3000) and
ignores `-p`.

Which pages are static, and how post changes and `npm run revalidate` refresh
them, is described in the root README under Static pages.
