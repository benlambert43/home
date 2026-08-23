# home

Ben Lambert's personal website.
Uses npm workspace.

| Package       |                                  |
| ------------- | -------------------------------- |
| `home-web-ui` | Next.js site.                    |
| `home-server` | Express + mongoose API.          |
| `home-shared` | Shared frontend + backend types. |

## Commands

docker compose up -d

npm run dev

npm run dev:server

## Linting

Lint rules shared by every workspace live in eslint.config.base.mjs

Each workspace's `eslint.config.mjs` layers its own framework config and ignores on top of the root base eslint config.

## Timestamps

All timestamp strings should be in ISO 8601 format.
