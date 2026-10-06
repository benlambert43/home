# home

Ben Lambert's personal website.
Uses npm workspace.

| Package       |                                                   |
| ------------- | ------------------------------------------------- |
| `home-web-ui` | Next.js site.                                     |
| `home-server` | Express + mongoose API.                           |
| `home-shared` | Shared frontend + backend types and runtime code. |

## Commands

docker compose up -d

npm run dev

npm run dev:server

## Test accounts

`npm run seed` creates these accounts and sample blog posts in the local database. The server never sends email to either address.

| Role      | Email              | Password      |
| --------- | ------------------ | ------------- |
| Admin     | `test@example.com` | `testtest123` |
| Non-admin | `user@example.com` | `testtest123` |

## home-shared

home-shared must be built before web client and server are run.

`npm run dev` and `npm run dev:server` build it first.

## Post storage

home-server stores post files in `storage/` inside the directory it starts from, and logs the full path on startup. MongoDB post records point at these files, so backups, restores, and server moves must keep the database and the storage directory together: back up the database before the storage directory, and copy storage with a tool that preserves hard links (for example `rsync -H`).

## Post slugs

A post's address is `/blog/<slug>`. The slug is made from the title when the post is created and never changes. When a post is deleted its slug is retired, and no later post is given it.

`RESERVED_POST_SLUGS` in `home-shared/src/postSlug.ts` lists the slugs that static routes under `/blog` already use. It is maintained by hand. When adding a static route under `home-web-ui/app/blog`, add its name in lowercase to the list, and first check that no post already has that slug: the static route would take over the address and hide the post.

## Static pages after deployment

`next build` runs in CI without access to the API, so the build can only fully prerender the pages that show no posts:

| Pages                                                                                                                    | After the build                                     | Fully static                                     |
| ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- | ------------------------------------------------ |
| `/projects`, `/about` and their subpages, `/forgotpasswordsuccess` and `/profile/accountManagement/resetPasswordSuccess` | Static                                              | From the build                                   |
| `/`, `/blog`                                                                                                             | Static shell; the post list renders on every visit  | After `npm run revalidate`                       |
| `/blog/page/2`                                                                                                           | Rendered on every visit                             | After `npm run revalidate`                       |
| `/blog/<slug>`                                                                                                           | Not built                                           | After `npm run revalidate`, or their first visit |
| `/blog/page/<n>` beyond 2                                                                                                | Not built                                           | After their first visit                          |
| `/sitemap.xml`, `/feed.xml`                                                                                              | Rendered on every request from the cached post list | Never                                            |

`/blog/page/2` is in the build but, unlike `/blog`, has no shell: it checks the requested page number against the post count before it renders, outside the list's Suspense boundary, and without the API that check cannot be made at build time. `/sitemap.xml` and `/feed.xml` are route handlers, which have no first-visit save: after a build made without the API they are rendered on every request, from the cached post list, and are never saved as pages. A build made with the API reachable prerenders all of these.

`/signin`, `/createaccount`, `/forgotpassword`, `/profile`, `/settings`, the pages under `/profile/accountManagement` other than `resetPasswordSuccess`, `/blog/newPost` and `/blog/<slug>/edit` are never saved. Each reads the session cookie, or the query string, at the top of the page with no Suspense boundary below the layout, so it has no static shell: every visit renders the whole page, layout included. `export const instant = false` in each of these pages tells `next build` to accept the empty shell. `/session`, `/revalidate` and the image routes under `/blog` are route handlers that run on every request.

The site saves pages in `.next/server/route-cache` inside the web container. A new container starts again from the build output. After a restart of the same container, each page saved before the restart is rendered again on its first visit and saved again, while pages that were never saved keep their build output.

`npm run revalidate` brings the site to the fully static state. It marks the post lists and every post page for regeneration, then runs the postbuild render crawl, which programmatically exercises every route in the sitemap so each one is rendered and saved before a visitor or crawler arrives.

### When and where to run it

Run it on the home server, from a checkout of this repository, after every start of the web container, once the API container is up:

```bash
npm run revalidate -- https://benlambert.tech
```

It needs `sh` and `curl`, defaults to `http://localhost:3000` when no URL is given, and is safe to run again at any time. It is not needed after post changes: the site updates its saved pages itself (see [Post changes](#post-changes)).

### How it works

The script has two steps.

**Revalidate.** The script reads `REVALIDATE_SECRET` from the environment or `home-web-ui/.env`, then calls `POST /revalidate` on the site with the secret in an `x-revalidate-secret` header. The site compares the header with its own `REVALIDATE_SECRET` (403 if they differ) and checks that the API is reachable (503 if not). On a 503 or no answer the script retries every 2 seconds, 60 times by default (`REVALIDATE_ATTEMPTS` and `REVALIDATE_DELAY_SECONDS` change this), so it can be started before the API is ready. Once the API answers, the site marks `/`, `/blog`, every `/blog/page/<n>` and every `/blog/<slug>` for regeneration.

**Postbuild render crawl.** The script fetches `/sitemap.xml` and programmatically exercises every URL it lists, requesting them one at a time: the home, project and about pages, `/blog`, and every post. It keeps only the path of each URL and requests it from the site URL it was given, so it exercises the routes of that server even when the sitemap's origin (`BASE_SITE_URL`) is different, for example a test server on another port. Each line shows the path, the HTTP status and what happened, read from the `x-nextjs-cache` response header:

- `saved now` (`MISS`): this request rendered the page and the site saved it.
- `already saved` (`HIT` or `STALE`): the site served a page it had already saved.
- `not saved` (no header): the page was rendered for this request only, for example because the API went down.

The crawl requests every URL even after a failure, then exits with an error if any route answered with a status other than 200 or was not saved. `/blog/page/<n>` pages are not in the sitemap, so the crawl does not exercise them; they are saved on their first visit.

`REVALIDATE_SECRET` is required like the other variables in `home-web-ui/.env.template`; CI needs it set to build.

### Post changes

Creating, editing or deleting a post updates every saved page that shows posts, so the next visit to each one renders it again with the change and saves it. No script is needed.

Everything that reads posts goes through the cached lookups in `home-web-ui/app/lib/posts.ts`, which tag their results:

- every post list and post lookup, `/sitemap.xml` and `/feed.xml` carry the `posts` tag
- a post lookup also carries `post:<id>`, `post-slug:<slug>` and `post-author:<user id>`
- a post list also carries `post-author:<user id>` for each author in it

Saved pages inherit the tags of the lookups they used. The post actions in `home-web-ui/app/actions/posts.ts` then expire:

| Change | Expires                                                                             |
| ------ | ----------------------------------------------------------------------------------- |
| Create | `posts`, `post-slug:<slug>`, and `/`, `/blog`, `/blog/page/<n>`, `/blog/<slug>` |
| Edit   | `posts`, `post:<id>`, and `/`, `/blog`, `/blog/page/<n>`, `/blog/<slug>`         |
| Delete | `posts`, `post:<id>`, and `/`, `/blog`, `/blog/page/<n>`, `/blog/<slug>`         |

Expiring `posts` reaches the Recent Activity list on `/`, every list page, every post page (each links to its neighbours), the post metadata, the sitemap and the feed. The list paths and the post page route are expired as well, so that a change made before `npm run revalidate` has run still turns them fully static, and so that a page saved as a shell while the API was unreachable, which carries no post tags, is rendered again on its next visit. A visit that found no post saves the Post Not Found page, which carries `posts` and `post-slug:<slug>` and is reached by expiring them. A username change or account deletion expires `post-author:<user id>`, which reaches that author's posts and the lists that show them.

Post image URLs never change what they serve, because a post never reuses an image name, so `next/image` and browsers can cache them safely.

When adding a page or route that shows posts, read them through `getCachedPosts` or `getPost` (or tag the cached function with `POSTS_TAG`) so post changes reach it.

### Page counts

No page stores a page count. `Page N of M`, the Previous and Next links and the redirect from a page beyond the last one all come from the API's pagination, which the server recomputes on every request from the number of posts. Posts are listed by creation date, so editing a post never moves it to another page; only creating or deleting one changes the count. Every list page is expired on each change, so each shows the new count the next time it is visited, and a saved page beyond the new last page becomes a redirect to the last page on its next visit.

Two things can drift. The `?page=` the blog list adds to post links records the page the post was on when the link was made: after posts are added above it, the links back from the post page open that page, where the `#post-<slug>` anchor is no longer found, and a page number beyond the last page redirects to the last page. Changes that bypass the post actions, such as `npm run seed` or edits made directly in the database, expire nothing: a visit more than a day after a list page was saved serves it and renders it again in the background, and `npm run revalidate` refreshes the lists and the post pages but not the sitemap or the feed.

### Post pages

Post pages (`/blog/<slug>`) are not in the build. Cache Components only saves a dynamic route's pages after their first visit when the route exports `generateStaticParams`, and it refuses an empty list, so the route lists one placeholder slug that is never a post and prerenders as a 404. With the slug unknown until the visit, the route's shell is empty, and `export const instant = false` tells `next build` to accept that; `/blog/page/<n>` does the same. Each post is rendered the first time it is visited and served as a fully static page from then on, until a post is created, updated or deleted. The `?page=` the blog list adds to post links is read in the browser after hydration, so the same static page serves every list page.

A slug that is not a post answers HTTP status 404 with the Post Not Found page, and that page is saved like any post page. The post lookup caches the API's not-found answer for a day, as it does a post, so the route waits for the lookup before it sends headers and the `notFound()` it throws sets the status. Cache Components leaves a cached result that expires in under five minutes out of the saved page and asks for it again on every visit, which is what the lookup's error branch does with `"seconds"`: a post page first rendered while the API is unreachable is saved as a shell that answers 200 and renders the rest on each visit, so no not-found answer is ever saved during an outage. That shell has no lifetime of its own and is served until its path is expired, which every post change and `npm run revalidate` do for every post page; a restart with the API up also replaces it, in the background, on its first visit. A saved Post Not Found page carries the `posts` and `post-slug:<slug>` tags, so creating a post at that slug replaces it on the next visit; a change made outside the post actions, such as `npm run seed`, leaves it in place for up to a day, as with the list pages.

`/sitemap.xml` lists every post URL and `/feed.xml` the latest ones. Both read the post list through the cached lookups, so a post change reaches them, but their responses are only saved as pages when the build could reach the API: after a CI build they are rendered on every request from the cached list.

## Linting

Lint rules shared by every workspace live in eslint.config.base.mjs

Each workspace's `eslint.config.mjs` layers its own framework config and ignores on top of the root base eslint config.

## Timestamps

All timestamp strings should be in ISO 8601 format.

## License

Copyright (C) 2026 Ben Lambert

The source code is licensed under the GNU Affero General Public License, version 3 or later. See [LICENSE](LICENSE).

The license covers the code only. The photographs, other images, and writing in this repository and on the site, such as `home-web-ui/public/selfie.png`, are not licensed under it and remain the property of Ben Lambert.
