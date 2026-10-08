# @home/shared

Code shared by `home-server` and `home-web-ui`:

- request and response body types, and the Zod schemas that validate them
- post, user, notification and session token types, with their limits
- post Markdown rules: validation, excerpts, heading ids and image references
- post slug and image name generation

`scripts/build-shared.sh` compiles `src/` to `build/`, which the other
workspaces import at runtime; their types resolve from `src/`. It skips the
build when nothing changed, and the root `dev` and `dev:server` scripts and the
workspace `seed` and `test` scripts run it first. `npm run build` here forces a
rebuild.
