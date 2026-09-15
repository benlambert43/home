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

Each post revision is a folder at `storage/blog-posts/<post>/<revision>/` holding exactly three entries. Files a revision did not change are hard links to the previous revision's copies.

Images reach a post through an upload of up to 100 inline images plus a header image, each up to 100 MB:

1. `POST /api/v1/posts/uploads` starts an upload with the list of images to expect.
2. Each image is sent in its own `PUT` request. It streams into `storage/uploads/<upload>/incoming/` and moves to `storage/uploads/<upload>/full_size_images/`.
3. Creating or editing the post with the upload id moves the images into the new revision and deletes the upload.

## Linting

Lint rules shared by every workspace live in eslint.config.base.mjs

Each workspace's `eslint.config.mjs` layers its own framework config and ignores on top of the root base eslint config.

## Timestamps

All timestamp strings should be in ISO 8601 format.
