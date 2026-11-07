# Харнесс разработки

## Проверки

`pnpm check` последовательно запускает Prettier, нейминг, экспорт/проверку LikeC4, тесты харнесса, ESLint, Stylelint, TypeScript, Vitest и сборку workspace-пакетов. Архитектура проверяется целиком. E2E и будущие native checks — отдельные команды.

`pnpm check:package <name>` выбирает пакет и его транзитивных потребителей. Учитываются dependencies, devDependencies, peerDependencies и optionalDependencies. Проверяются полные каталоги выбранных пакетов, типы, тесты и сборка каждого выбранного пакета.

`pnpm check:changed [base]` объединяет diff относительно `origin/trunk` (или указанной базы), staged/unstaged и untracked-файлы. Без remote/base проверяются локальные изменения; неверная явно указанная база — ошибка. Удалённые файлы учитываются по владельцу. Корневые конфигурации, модель, scripts и неизвестные пути запускают полную проверку. Изменение только docs/README/Beads не запускает сборки.

`pnpm check:staged` запрещает частично staged-файлы, чтобы проверяемая версия совпадала с будущим commit. В чистом индексе он явно сообщает об отсутствии изменений.

`apps/.gitkeep` и `packages/.gitkeep` не считаются пакетами. Каталог пакета без `package.json` вызывает ошибку. При полном отсутствии пакетов команды сборки и unit-тестов явно пропускаются. E2E явно пропускаются при отсутствии приложений, в том числе в монорепе только с библиотеками. Наличие пакетов включает требования build/typecheck и реальный тестовый runner; ошибка runner передаётся вызывающей команде.

SCSS проверяется в apps и packages; отсутствие SCSS допустимо. Playwright ищет `apps/**/e2e/**/*.spec.ts`, без выдуманного dev-сервера. При добавлении приложения настройте его сервер и TypeScript project для e2e. Для native workspace объявите `check:rust`; корневая команда вызовет его через pnpm.

## Git и CI

Husky владеет hooks: pre-commit → `check:staged`, commit-msg → commitlint, pre-push → `check`. Не устанавливайте поверх него Beads hooks.

GitHub Actions для trunk/PR/manual выполняет frozen install, полный check, проверку сообщений commit и e2e. При ошибке сохраняет браузерные отчёты. Dependabot настроен для npm и Actions. Workflow не включает branch protection и не создаёт remote автоматически. В пустой основе нет продуктовых release/deploy jobs.

## Beads

```sh
pnpm beads:init
bd prime
bd ready --json
bd show <id>
bd update <id> --status in_progress
# Работа → проверки
bd close <id> --reason "Implemented and verified"
pnpm beads:export
```

Инициализация использует prefix `starter`, embedded Dolt и флаги `--skip-hooks --skip-agents --non-interactive --init-if-missing`. Каждая новая копия инициализирует локальную базу. Для восстановления переданной истории используйте `bd import .beads/issues.jsonl` только в подходящую новую базу. Не импортируйте старый snapshot поверх более свежих задач.

Dolt runtime и базы исключены из Git. JSONL — перенос записей, не полноценный backup и не live sync. Remotes исходного `proteus` не перенесены. Если `bd` недоступен, сохраняйте конкретный handoff и сообщайте об ограничении; не выдумывайте IDs и результаты синхронизации.

## Делегирование Kimi

Сохранён рабочий подход исходного проекта: ограниченные независимые задачи можно передавать установленному Kimi CLI. Сверяйте команду с `kimi --help`, используйте новую неинтерактивную сессию. Передавайте контекст, актуальные инструкции, ID задачи, разрешённые файлы и критерии приёмки. Для изменения кода используйте отдельный worktree и одного владельца на файл; основной агент проверяет diff и объединённый результат. Credentials остаются у CLI. Если CLI недоступен или не авторизован, продолжайте локально и явно сообщите об этом.
