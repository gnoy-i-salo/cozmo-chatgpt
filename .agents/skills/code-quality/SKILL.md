---
name: code-quality
description: Apply the starter workspace code conventions when changing TypeScript packages, SolidJS UI models, SCSS or native adapters. Covers ownership, public APIs and compatibility boundaries; product discovery and deployment are separate tasks.
---

# Workspace code quality

Read `AGENTS.md` and the linked repository architecture and code-style documents. Enforce the current workspace rules without importing product assumptions from the reference project.

Choose the owner before extracting logic. Keep package entrypoints explicit-reexports-only, use relative imports internally and public APIs externally. Avoid a universal utilities module or splitting trivial functions merely to meet a preferred file size.

Keep scenario state and commands in a slice model. Put transport and storage effects in `shared/api`; UI invokes its model. In SolidJS, create models inside their reactive owner, pass getters for changing props and preserve cancellation, stale-result guards and cleanup. Small visual state can remain in UI. Do not substitute React hooks or unrelated framework recipes.

Own fields use camelCase, types/components PascalCase, paths/package IDs kebab-case. CSS Modules use `blockMore__elementMore_modificatorMaybe`; apply base and modifier together. External keys, stable IDs and exact source text remain unchanged. Exact-file field exceptions require a documented boundary reason and tests.

Before changing serialized data, identify its writer, reader, version and owner. Add explicit decoders and versioned writers with meaningful old/new, collision, corruption and recovery fixtures. Do not normalize arbitrary JSON or expose both legacy/new aliases as domain fields. Preserve the original until validation succeeds.

When native code is added, keep commands thin and delegate to scenarios. Preserve timeout, process cleanup and credential ownership. Introduce package-native checks and CI together with the first native implementation.

Use focused regression tests for behavior and negative fixtures for new harness restrictions. A pure move needs unchanged observable behavior, not an artificial red test. Run selective checks followed by the required full/UI/native checks for the change. Inspect actual results; a successful delegated process exit is not evidence that its tests passed.
