# War of Times

A 2-player online browser game in the style of Age of War: one lane, two bases. Buy units and destroy the enemy base.

Built with TypeScript: Phaser 3 + React on the client, Colyseus on Node.js on the server.

## Folder map

| Folder            | What lives there                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| `apps/client`     | Browser app: React menus/lobby, with the Phaser game screen mounted inside                       |
| `apps/server`     | Colyseus game server: one "room" per match, runs the game rules and syncs state to both players |
| `packages/shared` | Game rules and unit stats used by both client and server                                         |
| `.github/`        | Issue/PR templates, CI and agent workflows                                                       |

## Setup

Requires Node.js and Yarn 1 (workspaces).

> The app code is added in milestone M0 (Foundation). Until a root `package.json` exists, the commands below won't work yet.

```bash
yarn install --frozen-lockfile   # install dependencies
yarn lint                        # lint
yarn typecheck                   # TypeScript type check
yarn test                        # Vitest tests
```

See `CLAUDE.md` for contribution and agent rules.
