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

## home-shared

home-shared must be built before web client and server are run.

`npm run dev` and `npm run dev:server` build it first.

## Post storage

home-server stores post files in `storage/` inside the directory it starts from, and logs the full path on startup. MongoDB post records point at these files, so backups, restores, and server moves must keep the database and the storage directory together: back up the database before the storage directory, and copy storage with a tool that preserves hard links (for example `rsync -H`).

## Post images

home-server keeps every post image as it was uploaded and makes `large`, `medium`, and `small` thumbnails of it. `posts/:id/images/:name` serves the `large` thumbnail, `posts/:id/images/:name/:size` a named size, and `posts/:id/images/:name/fullSize` the upload itself. The sized thumbnails and the upload are there for frontend clients other than Next.js.

home-web-ui treats the `large` thumbnail as the full size original image. `/blog/[id]/images/[name]` proxies the API's default image route and is the only post image URL the site shows. `next/image`, with its default optimizer, makes every size the site shows from it, the blog list thumbnails included. Do not give `next/image` the `fullSize`, `medium`, or `small` image, and do not mark a post image `unoptimized`.

A post page links each of its images to `/blog/[id]/images/[name]/fullSize`, which proxies the API's `fullSize` route and opens the upload itself in a new tab. It is only ever a link target, never an image source, so the browser fetches it on a click and the optimizer never sees it. The API does not have to be reachable from the browser for this.

A post never reuses an image name. The `next/image` optimizer caches by URL and cannot be told that an image changed, so the API refuses an uploaded image whose name any revision of the post has used, and a changed image always gets a new URL. Clients keep the original file name and, when it is taken, add a random suffix with `uniquePostImageName`.

An uploaded image may be at most 49 MB, counted as 49,000,000 bytes (`MAX_POST_IMAGE_BYTES` in home-shared). The optimizer refuses a source image over 50,000,000 bytes by default, and until a `large` thumbnail is ready the API serves the upload in its place, so the cap keeps every upload under that limit without changing the Next.js configuration.

## Linting

Lint rules shared by every workspace live in eslint.config.base.mjs

Each workspace's `eslint.config.mjs` layers its own framework config and ignores on top of the root base eslint config.

## Timestamps

All timestamp strings should be in ISO 8601 format.
