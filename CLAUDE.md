# CLAUDE.md

War of Times is a 2-player online browser game in the style of Age of War (one lane, two bases, buy units, destroy the enemy base). It is written in TypeScript: Phaser 3 + React for the client, and Colyseus on Node.js for the server.

> This file currently holds only the agent and review rules. The rest (architecture, conventions) is added with the M0 Foundation code.

## Folder map

| Folder | What lives there | Side |
|---|---|---|
| `apps/client` | Browser app: React menus/lobby, with the Phaser game screen mounted inside | Frontend |
| `apps/server` | Colyseus game server: one "room" per match, runs the game rules and syncs state to both players | Backend |
| `packages/shared` | Game rules and unit stats used by both client and server | Both |
| `.github/` | Issue/PR templates, CI and agent workflows | CI |

## Commands

These may not exist yet before M0. If `package.json` is missing, skip them.

```bash
yarn install --frozen-lockfile   # install dependencies (Yarn 1 workspaces)
yarn lint                        # lint
yarn typecheck                   # TypeScript type check
yarn test                        # Vitest tests
```

## Agent rules

These apply to the AI agent when it implements an issue.

- **The TL chooses agent tasks.** Only work on issues with the `agent-ready` label.
- **Branch:** `agent/issue-<n>`, created from `main`.
- **Size:** about 200 changed lines of code or fewer.
- **Scope:** only touch files listed in the issue's "Files in scope". Respect "Out of scope".
- **No backend/netcode changes** (`apps/server/**`, `packages/shared/**`) and **no CI changes** (`.github/**`), unless the issue's "Files in scope" includes them.
- **Before opening the PR:** run `yarn lint`, `yarn typecheck` and `yarn test` (if they exist) and fix failures.
- **PR body** follows `.github/pull_request_template.md` and must contain `Closes #<n>`.
- **Never merge** a PR. Only the TL merges.
- **Never write the text `@claude`** in commits, comments, PRs or issues. It triggers another workflow.
- If you can't finish, don't open a PR. Comment on the issue explaining what blocked you.

## Review rules

These apply to the Claude reviewer on every PR (TL and agent).

**Blocking** (verdict = changes requested). Only these:
1. An acceptance criterion of the linked issue is not met.
2. A rule in this file is broken.
3. A correctness problem: a bug, a type error, a missing import, a broken command, wrong logic.
4. Agent PRs only: a guardrail is broken (over ~200 changed lines, a file outside "Files in scope", or backend/netcode/CI changes the issue didn't scope).

**Non-blocking** (never causes changes requested): style, naming, small refactors, nice-to-haves. List them as suggestions. If there are no blocking problems, the verdict is approve, even with non-blocking notes. This prevents endless nitpick loops.

**Backend "why" — only on comments.** The TL is a frontend developer who is new to backend code.
- Never explain backend code you have no comment about. No comment means no explanation.
- When a review comment (blocking or non-blocking) is about code in `apps/server/**` or `packages/shared/**`, explain in that comment, in plain language: the backend concept involved (for example "room", "state sync", "tick"; define any jargon), what could go wrong (with a concrete example if possible), and the better approach.
