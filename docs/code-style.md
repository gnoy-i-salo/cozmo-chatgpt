# Стандарт кода

- Собственные поля TypeScript — camelCase; типы и компоненты — PascalCase; пути и package IDs — kebab-case.
- Обязательные имена `AGENTS.md`, `README.md`, `SKILL.md`, `PULL_REQUEST_TEMPLATE.md`, `Cargo.toml`, `Cargo.lock`, `LICENSE` являются точечными исключениями. Platform icons разрешены только в `apps/*/src-tauri/icons/`.
- Внешние схемы сохраняют исходные имена. Исключения собственных полей задаются точным файлом, списком полей и причиной в `scripts/field-naming-exceptions.json`; исходный список пуст. Произвольные строки и JSON внутри строк не переименовываются.
- CSS Modules: `blockMore__elementMore_modificatorMaybe`; базовый класс и модификатор применяются вместе. CSS/SCSS tokens — camelCase.
- ESLint использует реальные TS projects, `recommendedTypeChecked`, `no-floating-promises` (включая `void`), запрет `any`, complexity ≤25 и max-depth ≤4. SolidJS правила готовы для будущих приложений.
- TypeScript: strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes, noUnusedLocals/Parameters, verbatimModuleSyntax. Каждый новый TS-файл должен входить в ближайший `tsconfig.json`.
- Prettier: single quotes, trailing commas, printWidth 100. EditorConfig: UTF-8, LF, 2 пробела; Rust — 4. Markdown сохраняет смысловые пробелы переноса строки.

Форматируйте затронутые файлы через `pnpm exec prettier --write <paths>`. `pnpm format` предназначен для всего проекта. Публичные API, FSD и model/UI границы описаны в [архитектуре](architecture.md).

Для изменения поведения добавляйте содержательный regression test. Для новых запретов харнесса нужны положительные и отрицательные примеры. Не ослабляйте gate ради зелёного результата. Чистое перемещение кода проверяется сохранением наблюдаемого поведения, без искусственного падающего теста.
