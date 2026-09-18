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

Builds with `output: "standalone"`.
Next preserves the repo structure on deployment: the entrypoint is .next/standalone/home-web-ui/server.js, not .next/standalone/server.js.
