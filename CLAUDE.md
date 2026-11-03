# CLAUDE.md

War of Times is a 2-player online browser game in the style of Age of War (one lane, two bases, buy units, destroy the enemy base). It is written in TypeScript: Phaser 4 + React for the client, and Colyseus on Node.js for the server.

> This file holds the conventions and the agent and review rules. Architecture notes are added with the M0 Foundation code.

## Folder map

| Folder            | What lives there                                                                                | Side     |
| ----------------- | ----------------------------------------------------------------------------------------------- | -------- |
| `apps/client`     | Browser app: React menus/lobby, with the Phaser game screen mounted inside                      | Frontend |
| `apps/server`     | Colyseus game server: one "room" per match, runs the game rules and syncs state to both players | Backend  |
| `packages/shared` | Game rules and unit stats used by both client and server                                        | Both     |
| `.github/`        | Issue/PR templates, CI and agent workflows                                                      | CI       |

## Commands

These may not exist yet before M0. If `package.json` is missing, skip them.

```bash
yarn install --frozen-lockfile   # install dependencies (Yarn 1 workspaces)
yarn lint                        # lint
yarn typecheck                   # TypeScript type check
yarn test                        # Vitest tests
```

## Conventions

Some rules refer to tools that aren't set up yet (Prettier, ESLint, Vitest, Tailwind). Don't set a tool up unless the issue's Scope asks for it. Once a tool exists, its rules apply.

All rules in this section are blocking in review, on code a PR adds or changes. Pre-existing code that breaks them is a foundation concern, not a blocker.

### Naming

| Thing                                          | Style                                  | Example                                         |
| ---------------------------------------------- | -------------------------------------- | ----------------------------------------------- |
| Files and folders                              | `kebab-case` (except React components) | `unit-stats.ts`, `room-code/`                   |
| React component files                          | `PascalCase`, same as the component    | `LobbyScreen.tsx` exports `LobbyScreen`         |
| Variables, functions, methods                  | `camelCase`                            | `spawnUnit()`, `goldPerSec`                     |
| Classes, types, interfaces, React components   | `PascalCase`                           | `MatchRoom`, `UnitStats`, `LobbyScreen`         |
| Module-level constants (fixed config values)   | `UPPER_SNAKE_CASE`                     | `TICK_MS`, `LANE_LENGTH_PX`                     |
| Lookup objects of constant keys                | `UPPER_SNAKE_CASE` object and keys     | `SCENE_KEYS.BATTLE`                             |
| String values (scene/asset/message/event keys) | `kebab-case`                           | `'battle'`, `'unit-melee-walk'`, `'spawn-unit'` |
| Booleans                                       | `is`/`has`/`can`/`should` prefix       | `isReady`, `hasTurret`, `canAfford`             |
| Event handlers                                 | `handleX` inside; `onX` for props      | `handleSpawnClick`, `onReady`                   |
| Generics                                       | `T` or `TName`                         | `TState`                                        |

- **Acronyms are words:** `roomId`, `HudScene`, `serverUrl` (not `roomID`, `HUDScene`, `serverURL`).
- **Allowed abbreviations only:** `id`, `hp`, `ui`, `dt`, `dx`, `dy`, `ms`, `px`, `fps`, `x`, `y`. Spell out everything else (`damage`, not `dmg`).
- **Units in numeric names:** `cooldownMs`, `speedPxPerSec`, `rangePx`, `goldCost`. Time is always milliseconds, distance always pixels (world units).
- **No `I` prefix** on interfaces. **No TS `enum`:** use an `as const` array or object plus a union type (`export const UNIT_TYPES = ['melee', 'ranged', 'tank'] as const; export type UnitType = (typeof UNIT_TYPES)[number];`).
- **Role suffixes in file names:** `*.scene.ts` (Phaser scene), `*.room.ts` (Colyseus room), `*.schema.ts` (Colyseus synced state), `*.test.ts` (Vitest).
- Only `.tsx` files that export a component are PascalCase. Hooks and utils stay kebab-case (`use-room.ts`).
- To change only the letter case of a file name, use `git mv` (macOS file names are case-insensitive).

### Packages and imports

- Packages: `@wot/client` (`apps/client`), `@wot/server` (`apps/server`), `@wot/shared` (`packages/shared`).
- Dependency direction: `client → shared` and `server → shared`. `shared` imports nothing from the apps, and no Phaser, React or Colyseus server code.
- Import other packages only by package name (`import { UNIT_STATS } from '@wot/shared'`), never by relative path. `shared` exports everything through `src/index.ts`.
- Import order: Node built-ins → external → `@wot/*` → `@/` → relative. The `@/` → `src/` alias exists in the client only.

### `packages/shared`

- Layout: `src/index.ts`, `config/` (game constants), `data/` (stat tables), `rules/` (pure functions), `protocol/` (message names, payload types, validators).
- Rules are pure functions: no side effects, no `Date.now()`, no `Math.random()` (pass values or an rng in).
- Data tables are `readonly` and use `as const satisfies Record<UnitType, UnitStats>`.
- Every exported rule and payload validator has tests. Exported functions have a short TSDoc.

### Client (`apps/client`)

- Layout: `main.tsx`, `index.css`, `app/` (`App.tsx`), `ui/screens/`, `ui/components/`, `ui/hooks/`, `game/scenes/`, `game/objects/`, `game/systems/`, `game/keys/`, `game/game-bridge.ts`, `net/`. Assets in `public/assets/`, with kebab-case file names.
- React: function components only, **named exports only** (no `export default`, except config files that need it, such as `vite.config.ts`). Props type is `<Component>Props`; hooks are `useX` in `use-x.ts`. No global state library; React state and context are enough.
- Styling: Tailwind CSS for React UI only (Phaser draws the battlefield). Use `clsx` for conditional classes, no `@apply`, no hard-coded hex colours in JSX (theme tokens live in `@theme` in `index.css`). Extract a component for repeated class lists.
- Phaser: scene `BattleScene` in `battle.scene.ts`. No magic strings for scene, asset or event keys: use `SCENE_KEYS`, `ASSET_KEYS` (keys match file names). Remove listeners on scene `shutdown`; don't create objects in `update()` every frame.
- React and Phaser talk only through `game-bridge.ts` (a typed event emitter, event names in one `as const` object). React never touches Phaser objects; Phaser never imports React.
- The client never decides outcomes (damage, gold, win). It sends intents and draws server state.

### Server (`apps/server`)

- Layout: `index.ts` (starts the server), `app.config.ts` (Colyseus setup, room registration), `config.ts` (the only place that reads `process.env`), `rooms/<name>.room.ts`, `rooms/schema/<name>.schema.ts`, `lib/logger.ts`.
- Each room and schema file starts with a 2–3 line plain-language comment on what it does.
- Rooms: class `MatchRoom` in `match.room.ts`, registered name from a constant (`ROOM_NAMES.MATCH = 'match'`). Keep rooms thin: receive message → validate → call a shared rule → write the result into state.
- Schemas: class names end in `State` (`MatchState`). Sync only what the client needs to draw. Collections are `MapSchema` keyed by id.
- Messages: names live in `@wot/shared` protocol. Client → server names are imperative (`'spawn-unit'`), server → client names are past tense (`'match-ended'`). Handlers are `handle<Message>`. Validate every payload with a type guard from shared (`isSpawnUnitPayload`). An invalid message is ignored and logged with `logger.warn`; never throw in a handler.
- Game loop: `setSimulationInterval((dtMs) => this.tick(dtMs), TICK_MS)`; `tick` calls shared rules in a fixed order (economy → spawn → move → combat → cleanup → win check).
- Ids: `sessionId`, `unitId`, `roomId`, `roomCode`.
- Env vars are `UPPER_SNAKE` and read only in `config.ts`. Client env vars start with `VITE_`. Commit `.env.example`, never `.env`.
- Log with `logger.info/warn/error` from `lib/logger.ts`, never `console.log`.

### TypeScript

- No `any` (use `unknown` and narrow). No non-null `!` outside tests.
- `type` by default; `interface` only when you need `extends` on object shapes.
- `import type { X }` for type-only imports.
- Early returns over nested `if`s. Soft limits: function ~40 lines, file ~300 lines.
- Comments explain why, not what. `// TODO(#<issue>):` must reference an issue.

### Tests

- Co-located: `combat.test.ts` next to `combat.ts`.
- `describe('<function or class>')` and `it('<behaviour in plain English>')`, for example `it('returns 0 damage when the defender is already dead')`.
- No snapshot tests for game logic.

### Git

- **Types:** `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `style`, `chore`, `ci`. **Scopes:** `client`, `server`, `shared`, `repo` (root config or many places), `ci`, `agent` (agent workflows and prompts).
- **Branch:** `<type>/<issue>-<short-desc>`, lowercase kebab-case, 2–5 words, 50 characters or fewer (`feat/12-unit-spawn`). Agent branches are `agent/issue-<n>`.
- **Commit message:** `<type>(<scope>): <subject>`, header 72 characters or fewer. The subject is imperative ("add", not "added"), starts lowercase, has no final period and describes the effect, not the file (`fix(client): stop units jittering between server updates`). Optional body says why.
- **Breaking change** (a message name or payload, or a synced schema field, changes): add `!` after the scope and a `BREAKING CHANGE:` footer.
- **PR title:** same format as a commit header, 72 characters or fewer, no issue number. Put `Closes #<n>` in the body. If the change spans several workspaces, use the scope of the main change, or `repo`.
- **Merge:** squash only, so the PR title becomes the commit on `main`.

## Agent rules

These apply to the AI agent when it implements an issue.

- **The TL chooses agent tasks.** Only work on issues with the `agent-ready` label.
- **Branch:** `agent/issue-<n>`, created from `main`.
- **Size:** about 200 changed lines of code or fewer.
- **Scope:** only make changes covered by the issue's Scope (a high-level description; you decide which files to change). Nothing listed under "Out of scope", and no unrelated changes.
- **No backend/netcode changes** (`apps/server/**`, `packages/shared/**`) and **no CI changes** (`.github/**`), unless the issue's scope explicitly needs them.
- **Before opening the PR:** run `yarn format`, `yarn lint`, `yarn typecheck` and `yarn test` — the ones that exist — and fix failures.
- **PR body** follows `.github/pull_request_template.md` and must contain `Closes #<n>`.
- **Never merge** a PR. Only the TL merges.
- **Never write the text `@claude`** in commits, comments, PRs or issues. It triggers another workflow.
- If you can't finish, don't open a PR. Comment on the issue explaining what blocked you.
- **Stop and ask when the foundation is wrong.** Before building, read the code the issue builds on. If doing the issue as written means building on code or a decision you believe is wrong, and fixing it is outside the issue's Scope, stop: open no PR and escalate with evidence (file + lines), why it's a problem, options, and a drafted follow-up issue. Never fix the foundation yourself outside the Scope.
- **Smaller worries are Concerns, not stops.** If you can still do the issue correctly, do it and list the worries under "## Concerns" in the PR body.
- Never escalate over style, naming or personal preference. Conventions violations are fixed, not escalated. If the issue's wording conflicts with Conventions, follow Conventions and mention it under "## Concerns". When unsure, choose Concern.

## Review rules

These apply to the Claude reviewer on every PR (TL and agent).

**Blocking** (verdict = changes requested). Only these:

1. An acceptance criterion of the linked issue is not met.
2. A rule in this file is broken.
3. A correctness problem: a bug, a type error, a missing import, a broken command, wrong logic.
4. Agent PRs only: a guardrail is broken (over ~200 changed lines, changes outside the issue's Scope, or backend/netcode/CI changes the Scope didn't include).

Rule 2 includes Conventions, but only on code the PR adds or changes. Breaking a Conventions rule in pre-existing code is a foundation concern. A rule for a tool that isn't set up yet is not broken just because the tool is missing.

**Non-blocking** (never causes changes requested): style and naming not covered by Conventions, small refactors, nice-to-haves. List them as suggestions. If there are no blocking problems, the verdict is approve, even with non-blocking notes. This prevents endless nitpick loops.

Non-blocking notes go only in the review summary, never as inline comments (every inline thread must be resolved before merging).

**Foundation concerns** (never blocking on their own): if the PR builds on existing code or a decision outside the diff that looks wrong, list it under "Foundation concerns (for the TL)" in the summary, with evidence, why, and a suggested follow-up. Also respond to each point in the PR's "## Concerns" section.

**Backend "why" — only on comments.** The TL is a frontend developer who is new to backend code.

- Never explain backend code you have no comment about. No comment means no explanation.
- When a review comment (blocking or non-blocking) is about code in `apps/server/**` or `packages/shared/**`, explain in that comment, in plain language: the backend concept involved (for example "room", "state sync", "tick"; define any jargon), what could go wrong (with a concrete example if possible), and the better approach.
