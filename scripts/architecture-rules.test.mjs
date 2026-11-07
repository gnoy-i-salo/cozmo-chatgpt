import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkImport, hasCycle, importsOf } from './architecture-rules.mjs';
import { affectedPackages } from './workspace.mjs';
const packages = [
  { name: '@starter-app/contracts', path: 'packages/contracts', dependencies: {} },
  {
    name: '@starter-app/intelligence',
    path: 'packages/intelligence',
    dependencies: { '@starter-app/contracts': 'workspace:*' },
  },
  {
    name: '@starter-app/desktop',
    path: 'apps/desktop',
    dependencies: { '@starter-app/intelligence': 'workspace:*', 'solid-js': '1.9.18' },
  },
  {
    name: '@starter-app/auth',
    path: 'apps/auth',
    dependencies: { '@starter-app/contracts': 'workspace:*', 'solid-js': '1.9.18' },
  },
];
const edges = new Set([
  '@starter-app/intelligence->@starter-app/contracts',
  '@starter-app/desktop->@starter-app/intelligence',
  '@starter-app/auth->@starter-app/contracts',
]);
const check = (file, specifier) => checkImport(file, specifier, packages, edges);
test('parser sees static, export, dynamic, require and type imports', () => {
  assert.deepEqual(
    importsOf(
      "import type { A } from 'a'; export * from 'b'; import('c'); require('d'); type T = import('e').T;",
    ),
    ['a', 'b', 'c', 'd', 'e'],
  );
  assert.deepEqual(importsOf('import(variable)'), ['<non-literal-import>']);
});
test('allows modeled imports; rejects missing edges, deep imports and relative escapes', () => {
  assert.equal(check('packages/intelligence/src/index.ts', '@starter-app/contracts'), null);
  assert.match(check('packages/contracts/src/index.ts', '@starter-app/intelligence'), /LikeC4/);
  assert.match(
    check('apps/desktop/src/app/app.tsx', '@starter-app/intelligence/src/provider'),
    /deep import/,
  );
  assert.match(check('packages/contracts/src/index.ts', '../../intelligence/src/index'), /escapes/);
  assert.match(check('packages/contracts/src/index.ts', 'solid-js'), /undeclared/);
});
test('FSD permits descending public APIs, rejects upward, cross-slice and deep imports', () => {
  assert.equal(
    check('apps/desktop/src/pages/home/ui/home.tsx', '../../../features/settings'),
    null,
  );
  assert.match(
    check('apps/desktop/src/features/settings/ui/settings.tsx', '../../../pages/home'),
    /upward/,
  );
  assert.match(
    check('apps/desktop/src/features/settings/ui/settings.tsx', '../../profile'),
    /cross-slice/,
  );
  assert.match(
    check('apps/desktop/src/pages/home/ui/home.tsx', '../../../features/settings/ui/settings'),
    /deep import/,
  );
  assert.equal(
    check('apps/desktop/src/features/settings/ui/settings.tsx', '../../../shared/lib/storage'),
    null,
  );
});
test('auth follows the same FSD boundaries, including its entrypoint', () => {
  assert.equal(
    check('apps/auth/src/pages/callback/ui/callback.tsx', '../../../features/return'),
    null,
  );
  assert.equal(check('apps/auth/src/main.tsx', './app/app'), null);
  assert.equal(check('apps/auth/src/main.ts', './app'), null);
  assert.match(
    check('apps/auth/src/features/return/ui/return.tsx', '../../../pages/callback'),
    /upward/,
  );
  assert.match(
    check('apps/auth/src/features/return/ui/return.tsx', '../../connection'),
    /cross-slice/,
  );
  assert.match(
    check('apps/auth/src/pages/callback/ui/callback.tsx', '../../../features/return/ui/return'),
    /deep import/,
  );
  assert.match(check('apps/auth/src/main.tsx', './features/return'), /entrypoint/);
  assert.match(check('apps/auth/src/main.ts', './features/return'), /entrypoint/);
  assert.match(check('apps/auth/src/app/app.tsx', '../utilities/redirect'), /unknown FSD layer/);
});
test('detects dependency cycles', () => {
  assert.equal(hasCycle(packages, edges), false);
  assert.equal(
    hasCycle(packages, new Set([...edges, '@starter-app/contracts->@starter-app/desktop'])),
    true,
  );
});
test('selective checks include transitive dependents and deleted-file owners', () => {
  assert.equal(affectedPackages(packages, ['packages/contracts/src/deleted.ts']).length, 4);
  assert.deepEqual(
    affectedPackages(packages, ['apps/desktop/src/app/app.tsx']).map((pkg) => pkg.name),
    ['@starter-app/desktop'],
  );
  assert.deepEqual(affectedPackages(packages, ['docs/readme.md']), []);
});
