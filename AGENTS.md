# Starter agent harness

## Start

- Read `README.md`, `docs/architecture.md` and `docs/harness.md` before changes.
- Track work with Beads: `bd ready --json`, `bd show <id>`, then `bd update <id> --status in_progress`.
- Use `bd prime` for the installed workflow. Initialize with `pnpm beads:init`; Husky owns Git hooks.
- If `bd` is unavailable, report it and leave a concrete handoff; never invent IDs or synchronization.
- Main branch: `trunk`. All workspace packages are private and named `@starter-app/*`.

## Small changes and verification

- One independently reviewable concern per change. Preserve unrelated work.
- Use atomic Conventional Commits such as `feat(core): ...` or `test(harness): ...`.
- For behavior changes, write a focused regression test, confirm the intended failure, implement and refactor with tests green. A tool startup failure is not the red phase.
- Pure moves require characterization and repeat verification, not artificial failures.
- Run `pnpm check:package <name>` or `pnpm check:changed`; run `pnpm check` before pushing. UI behavior also needs `pnpm test:e2e`; native changes require the owning package's native checks/build.
- Add negative fixtures for harness restrictions. Do not weaken gates, bypass hooks or claim checks that did not run.
- Review `git diff --check` and explicit staged paths. Do not stage secrets, generated databases or unrelated output.

## Architecture and code

- `architecture/workspace.c4` is the dependency source of truth. Update model, manifests and tests together.
- No cycles, deep package imports, relative cross-package imports or self-imports through public package APIs.
- Applications follow FSD: `app → pages → widgets → features → entities → shared`. No upward or cross-slice imports; use slice public APIs.
- Keep `index.ts` explicit-reexports-only. UI calls scenario models; native/transport/storage adapters belong in `shared/api`.
- Apply `docs/code-style.md`. Read `.agents/skills/code-quality/SKILL.md` for package, UI model, SCSS or native changes.
- Keep external schemas and source text intact. Decode legacy formats at their owning boundary; do not recursively rename arbitrary JSON or overwrite originals before validation.
- Keep provider credentials out of frontend, storage and Git. Installed CLIs own their authentication.

## Delegation

- When delegating independent bounded work, use an available subagent or installed Kimi CLI within the user's authorized scope. Check `kimi --help`; use a fresh non-interactive session, not an unrelated resumed session.
- Supply the Beads ID, context, instructions, allowed paths, acceptance criteria and checks. Give each file one owner; edits use isolated worktrees, read-only reviews may use the current tree.
- The main agent owns task transitions, exports, diff review and integration. Require changed files, actual test results and limitations in the handoff.
- Missing CLI/authentication is a reported limitation; continue locally. Delegation does not grant permission to publish, push or access unrelated accounts. Do not read or copy token files.

## Finish

- Report behavior, checks actually run and remaining limitations.
- Close tasks only when acceptance criteria are met, then `pnpm beads:export`.
- A JSONL snapshot is interchange, not live Dolt sync or a full backup.
