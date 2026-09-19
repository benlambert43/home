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

## Seed posts

`npm run seed` fills the blog with 30 example posts, and `npm run seed -- 50` with as many as asked for. It needs the database running and the admin account from `ADMIN_EMAIL` to exist. Posts that are already there are skipped by title, so it is safe to run again.

The first posts are a showcase, one for each kind of content a post can hold: every image format, animated and sideways images, large photographs, Markdown, code, long and short titles, and posts that have been edited. The rest are short filler so the list runs to several pages. Post text lives in `home-server/src/scripts/seed/posts/`, the images are drawn when the seed runs, and every post goes through the same upload, create, and edit code as the API.

## Linting

Lint rules shared by every workspace live in eslint.config.base.mjs

Each workspace's `eslint.config.mjs` layers its own framework config and ignores on top of the root base eslint config.

## Timestamps

All timestamp strings should be in ISO 8601 format.
