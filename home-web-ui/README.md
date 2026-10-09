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
Every one is required.

## Development

```bash
npm run dev
```

Serves on [localhost:3000](http://localhost:3000). This workspace's script does
not build `home-shared`; `npm run dev` from the repository root does.

## Post images

Post images come from the API's `large` thumbnail, which the site treats as the
full-size original, and `next/image` makes every smaller size from it. The API's
`medium` and `small` thumbnails are for other clients. The upload itself is only
a link target: clicking a post image opens it in a new tab.

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
