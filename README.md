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

## Linting

Lint rules shared by every workspace live in eslint.config.base.mjs

Each workspace's `eslint.config.mjs` layers its own framework config and ignores on top of the root base eslint config.

## Timestamps

All timestamp strings should be in ISO 8601 format.

## License

Copyright (C) 2026 Ben Lambert

The source code is licensed under the GNU Affero General Public License, version 3 or later. See [LICENSE](LICENSE).

The license covers the code only. The photographs, other images, and writing in this repository and on the site, such as `home-web-ui/public/selfie.png`, are not licensed under it and remain the property of Ben Lambert.
