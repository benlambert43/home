# home-web-ui

A Next.js site, uses BFF (backend-for-frontend) pattern in front of `home-server`:
server actions hold the API session cookie and make the API calls.
Route handlers do the same for image traffic that has to stream, and check the
`Origin` header themselves because they do not get the CSRF protection that
server actions have.

```bash
npm run dev
```

Serves on [localhost:3000](http://localhost:3000).

Post images always come from the API's `large` thumbnail, which the site treats
as the full size original, and `next/image` resizes from there. The upload
itself is only a link target: clicking a post image opens it in a new tab. The
API's `medium` and `small` thumbnails are for other clients, so let `next/image`
make every smaller size instead of asking the API for them.

Builds with `output: "standalone"`.
Next preserves the repo structure on deployment: the entrypoint is .next/standalone/home-web-ui/server.js, not .next/standalone/server.js.
