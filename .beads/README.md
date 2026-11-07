# Задачи Beads

Локальная база embedded Dolt создаётся командой `pnpm beads:init` с prefix `starter`.
Git hooks остаются под управлением Husky; `AGENTS.md` не генерируется заново.

- `bd ready --json` — доступные задачи.
- `bd prime` — рабочий цикл установленной версии.
- `pnpm beads:export` — экспорт записей в `issues.jsonl` после изменения состояния задач.

Стартовый snapshot пуст. Базы, locks и локальные runtime-файлы не входят в Git.
Remotes не заданы. Snapshot — перенос записей, а не live sync или полный backup.
Подробности: [харнесс](../docs/harness.md).
