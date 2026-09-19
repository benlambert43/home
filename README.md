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

home-web-ui treats the `large` thumbnail as the full size original image. `/blog/[id]/images/[name]` proxies the API's default image route and is the only post image URL the site uses. `next/image`, with its default optimizer, makes every size the site shows from it, the blog list thumbnails included. Do not fetch `fullSize`, `medium`, or `small` from the web UI, and do not mark a post image `unoptimized`.

## Linting

Lint rules shared by every workspace live in eslint.config.base.mjs

Each workspace's `eslint.config.mjs` layers its own framework config and ignores on top of the root base eslint config.

## Timestamps

All timestamp strings should be in ISO 8601 format.
