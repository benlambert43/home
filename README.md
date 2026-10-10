# home

Ben Lambert's personal website, an npm workspaces monorepo.

| Package       |                                                                                                                                         |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `home-web-ui` | Next.js site. Talks to the API only from the server (see [home-web-ui/README.md](home-web-ui/README.md)).                               |
| `home-server` | Express + Mongoose API on port 4000, under `/api/v1`: `accountManagement`, `signIn`, `notifications`, `posts`. Post files live on disk. |
| `home-shared` | Types, Zod schemas and Markdown, slug and image-name code used by both (see [home-shared/README.md](home-shared/README.md)).            |

## Development

Needs Node 24, npm, Docker and [ShellCheck](https://www.shellcheck.net/).

1. `npm install`
2. Copy `.env.template` to `.env` in the root (the dev database), `home-server` and `home-web-ui`, and fill them in. `npm run env:placeholders` writes workspace `.env` files with placeholder values instead, which is enough to build and test (CI does this).
3. `docker compose -f docker-compose.dev.yml up -d` starts MongoDB on port 27017.
4. `npm run dev:server` (API) and `npm run dev` (site on [localhost:3000](http://localhost:3000)). Both build `home-shared` first.
5. `npm run seed` adds the test accounts and sample posts. It refuses a `MONGO_URI` that is not on localhost, skips posts that already exist, and takes a post count (default 33).

| Command                       |                                                                                                                                                                 |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run check`               | The full check: format, lint, typecheck, deprecated API use, shell scripts, test, build. CI runs it in separate steps. `-- --no-build` skips the build.         |
| `npm run format`, `lint:fix`  | Fix formatting and lint findings. `format:check`, `lint`, `typecheck`, `lint:deprecations`, `lint:shell` and `test` run one check each.                         |
| `npm run build`               | Builds every workspace.                                                                                                                                         |
| `npm run smoke`               | Builds the production stack, starts it with the values in `smoke.env`, waits for every healthcheck, runs revalidate and a few requests, then removes it.        |
| `npm run clean`               | `git clean` everything ignored except `.env` files, and resets the dev database. Refuses to delete uncommitted files without `--force`; `--dry-run` only lists. |
| `npm run revalidate -- <url>` | Makes a deployed site fully static (see [Static pages](#static-pages)).                                                                                         |

The pre-commit hook runs the same checks on staged files only; `git commit --no-verify` bypasses it. Lint rules shared by every workspace live in `eslint.config.base.mjs`; each workspace's `eslint.config.mjs` layers its framework config and ignores on top. Timestamp strings are ISO 8601. Dependabot updates npm (through the root lockfile only), GitHub Actions, the Dockerfiles and compose images weekly.

## Test accounts

`npm run seed` creates these accounts. The server never sends email to either address.

| Role      | Email              | Password      |
| --------- | ------------------ | ------------- |
| Admin     | `test@example.com` | `testtest123` |
| Non-admin | `user@example.com` | `testtest123` |

## Deployment

`docker-compose.yml` is the production stack: `database` (MongoDB), `api` (`home-server`), `web` (`home-web-ui`) and `cloudflared`, which publishes the site through a Cloudflare Tunnel, plus two one-shots: `storage-ownership`, which fixes file ownership in `post-storage` before `api` starts, and `revalidate`, which makes the site fully static once `web` is up. No service publishes a host port; the tunnel is the only way in, and `cloudflared` shares a network only with `web`.

To deploy, from a checkout on the home server:

```bash
git pull && docker compose up -d
```

The images build from `home-server/Dockerfile` and `home-web-ui/Dockerfile` with the repository root as the context. `api` and `web` set `pull_policy: build`, so every `docker compose up` rebuilds both images from the checkout and no `--build` flag is needed; with nothing changed, the rebuild is a few seconds of cache hits. `.dockerignore` lets in only what the builds need, so `.env` files and the storage directory never enter an image.

Every value comes from the environment the stack is started in, or a `.env` beside the compose file. A missing value fails `docker compose config`. `smoke.env` gives every variable a throwaway value: CI validates both compose files with it, builds the `api` and `web` images, and runs `npm run smoke` against them. The smoke test starts the stack under the project name `home-smoke`, so it never touches a `home-production` stack on the same machine, leaves `cloudflared` out, and removes everything it created when it finishes. `-- --no-build` uses images already tagged `home-smoke-api` and `home-smoke-web` instead of building them.

| Variable                                                                                                                                            | Used for                                                                                                                                |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `MONGO_INITDB_ROOT_USERNAME`, `MONGO_INITDB_ROOT_PASSWORD`                                                                                          | The database root user.                                                                                                                 |
| `MONGO_INITDB_DATABASE`, `MONGO_INITDB_ADMIN_USERNAME`, `MONGO_INITDB_ADMIN_PASSWORD`                                                               | The database and the user `api` connects as, created by `mongo-init.js` on first start.                                                 |
| `BASE_SITE_URL`                                                                                                                                     | The public origin, `https://benlambert.tech`. Baked into `web` at build time; also the API's CORS origin and the base of emailed links. |
| `NEXT_PUBLIC_CAPTCHA_PUBLIC`, `CAPTCHA_SECRET`                                                                                                      | The reCAPTCHA site key, baked into `web` at build time, and its secret.                                                                 |
| `API_SESSION_SECRET`, `BFF_SESSION_SECRET`, `REVALIDATE_SECRET`                                                                                     | Token signing for the API and the site, and the revalidate route.                                                                       |
| `ADMIN_FIRSTNAME`, `ADMIN_LASTNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`                                                                                | The admin account, which `api` creates on startup (see below).                                                                          |
| `EMAIL_OUTGOING_ADDRESS`, `EMAIL_OUTGOING_CLIENT_ID`, `EMAIL_OUTGOING_CLIENT_SECRET`, `EMAIL_OUTGOING_REFRESH_TOKEN`, `EMAIL_OUTGOING_APP_PASSWORD` | The Gmail sender: OAuth first, the app password as fallback.                                                                            |
| `CLOUDFLARE_CONNECTOR_TOKEN`                                                                                                                        | The tunnel's token from Cloudflare Zero Trust.                                                                                          |

On startup, `api` makes sure the admin account exists before it reports healthy, so the account is there before `web` and `cloudflared` start and the site goes public. If no account uses `ADMIN_EMAIL`, it creates one with the admin role, `ADMIN_PASSWORD` as its password and the email not yet confirmed. Once an admin account uses that email it changes nothing, so a password or username changed on the site stays changed, and deleting the account means the next start creates it again. If an account that is not an admin uses that email, `api` exits rather than promote it, since the account may be someone else's. Sign-ups never create admin accounts. Locally, leaving all four blank in `home-server/.env` skips this.

Post files live in the `post-storage` volume and the database in `database-data` and `database-config`; back them up together (see [Post storage](#post-storage)). Every `docker compose up` ends with the `revalidate` service making the site fully static; `docker compose up -d revalidate` runs it again on its own (see [Static pages](#static-pages)).

## Post storage

`home-server` stores post files in `storage/` inside the directory it starts from, and logs the full path on startup. MongoDB post records point at these files, so backups, restores and server moves must keep the database and the storage directory together: back up the database before the storage directory, and copy storage with a tool that preserves hard links (for example `rsync -H`).

In the production stack `storage/` is the `post-storage` volume. The `api` container runs as uid 1000 (`node`) with no capability to change ownership, so everything in the volume must belong to that uid. The `storage-ownership` service runs as root before `api` on every `docker compose up` and gives that uid to anything in the volume that lacks it, so a restore into the volume needs no `chown` of its own. A bind mount in place of the volume must be mounted into `storage-ownership` as well.

## Post slugs

A post's address is `/blog/<slug>`. The slug is made from the title when the post is created and never changes. When a post is deleted its slug is retired, and no later post is given it.

`RESERVED_POST_SLUGS` in `home-shared/src/postSlug.ts` lists the slugs that static routes under `/blog` already use, by hand. When adding a static route under `home-web-ui/app/blog`, add its name in lowercase to the list, and first check that no post already has that slug: the static route would take over the address and hide the post.

## Static pages

The `web` image builds without access to the API, so `next build` can only fully prerender the pages that show no posts:

| Pages                                                                                                                    | After the build                                     | Fully static                             |
| ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- | ---------------------------------------- |
| `/projects`, `/about` and their subpages, `/forgotpasswordsuccess` and `/profile/accountManagement/resetPasswordSuccess` | Static                                              | From the build                           |
| `/`, `/blog`                                                                                                             | Static shell; the post list renders on every visit  | After revalidation                       |
| `/blog/page/2`                                                                                                           | Rendered on every visit                             | After revalidation                       |
| `/blog/<slug>`                                                                                                           | Not built                                           | After revalidation, or their first visit |
| `/blog/page/<n>` beyond 2                                                                                                | Not built                                           | After their first visit                  |
| `/sitemap.xml`, `/feed.xml`                                                                                              | Rendered on every request from the cached post list | Never                                    |

`/signin`, `/createaccount`, `/forgotpassword`, `/profile`, `/settings`, the other pages under `/profile/accountManagement`, `/blog/newPost` and `/blog/<slug>/edit` read the session cookie or the query string with no Suspense boundary below the layout, so they have no static shell and render on every visit. Each exports `instant = false` so that `next build` accepts the empty shell; `/blog/[slug]` and `/blog/page/[page]` do the same because their shells are empty until the slug or page number is known. `/session`, `/revalidate` and the image routes under `/blog` are route handlers that run on every request.

Saved pages live inside the `web` container, so a new container starts again from the build output. Revalidation, run by the production stack's `revalidate` service or by hand with `npm run revalidate`, brings the site to the fully static state.

### Post pages

Cache Components only saves a dynamic route's pages after their first visit when the route exports `generateStaticParams`, and it refuses an empty list, so `/blog/[slug]` lists one placeholder slug that is never a post and prerenders as a 404. The `?page=` the blog list adds to post links is read in the browser after hydration, so one static page serves every list page.

A slug that is not a post answers 404 with the Post Not Found page, saved like any post page: the post lookup caches the API's not-found answer for a day and the `notFound()` it throws sets the status. While the API is unreachable the lookup's error result lives only seconds, which keeps it out of the saved page: the page is saved as a shell that answers 200 and renders the rest on each visit, until its path is expired by a post change or `npm run revalidate`. No not-found answer is ever saved during an outage. A post whose header image has no share image yet (they are generated after the write) is cached for minutes rather than days, so the share image appears without a post change.

### Revalidation

`scripts/revalidate-site.sh` makes the site fully static. In the production stack the `revalidate` service runs it against `http://web:3000` on every `docker compose up`, once `web` is healthy; it exits when done, and Docker retries it up to five times if it fails. It is safe to repeat, and not needed after post changes. To run it by hand against any server:

```bash
npm run revalidate -- https://benlambert.tech
```

It needs `sh` and `curl`, defaults to `http://localhost:3000`, and reads `REVALIDATE_SECRET` from the environment, `home-web-ui/.env` or `.env`. It has two steps:

1. **Revalidate.** `POST /revalidate` with the secret in an `x-revalidate-secret` header. The site answers 403 if the secret differs and 503 if it cannot reach the API; on 503 or no answer the script retries every 2 seconds, 60 times (`REVALIDATE_DELAY_SECONDS`, `REVALIDATE_ATTEMPTS`), so it can be started before the API is ready. On success the site expires `/`, `/blog`, every `/blog/page/<n>` and every `/blog/<slug>`.
2. **Postbuild render crawl.** Fetches `/sitemap.xml` and requests each listed path, one at a time, from the site URL it was given (only the path is kept, so a test server on another port works). Each line shows the path, the status and what the `x-nextjs-cache` header says: `saved now` (`MISS`), `already saved` (`HIT` or `STALE`) or `not saved` (no header, for example because the API went down). It requests every URL even after a failure, then exits with an error if any route did not answer 200 or was not saved. `/blog/page/<n>` pages are not in the sitemap; they are saved on their first visit.

### Post changes

Creating, editing or deleting a post through the site expires every saved page that shows posts, so the next visit to each renders and saves it again.

Everything that reads posts goes through the cached lookups in `home-web-ui/app/lib/posts.ts`, which tag their results: every list and post lookup, `/sitemap.xml` and `/feed.xml` carry `posts`; a post lookup also carries `post:<id>`, `post-slug:<slug>` and `post-author:<user id>`; a list carries `post-author:<user id>` for each author in it. Saved pages inherit the tags of the lookups they used. The post actions in `home-web-ui/app/actions/posts.ts` expire `posts`, plus `post-slug:<slug>` on create or `post:<id>` on edit and delete, and always the paths `/`, `/blog`, `/blog/page/[page]` and `/blog/[slug]`. The paths are expired as well so that a shell saved during an outage, which carries no post tags, is rendered again. A username change or account deletion expires `post-author:<user id>`.

When adding a page or route that shows posts, read them through `getCachedPosts` or `getPost`, or tag the cached function with `POSTS_TAG`, so post changes reach it.

Changes that bypass the post actions, such as `npm run seed` or edits made directly in the database, expire nothing: a cached lookup lives a day, after which a visit serves the saved page and renders it again in the background. `npm run revalidate` refreshes the lists and the post pages but not the sitemap or the feed.

Post image URLs never change what they serve, because a post never reuses an image name, so `next/image` and browsers can cache them.

### Page counts

No page stores a page count: `Page N of M`, the Previous and Next links and the redirect from a page beyond the last one all come from the API's pagination on each render. Posts are listed by creation date, so only creating or deleting a post changes the count, and every list page is expired on each change. The `?page=` on post links records the page the post was on when the link was made, so after posts are added above it the link back opens a page where the post's anchor is no longer found.

## License

Copyright (C) 2026 Ben Lambert

The source code is licensed under the GNU Affero General Public License, version 3 or later. See [LICENSE](LICENSE).

The license covers the code only. The photographs, other images, and writing in this repository and on the site, such as `home-web-ui/public/selfie.png`, are not licensed under it and remain the property of Ben Lambert.
