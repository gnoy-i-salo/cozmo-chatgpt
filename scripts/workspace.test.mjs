import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { affectedPackages, workspaces } from './workspace.mjs';

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'starter-workspace-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const directory of ['apps', 'packages']) {
    mkdirSync(join(root, directory));
    writeFileSync(join(root, directory, '.gitkeep'), '');
  }
  return root;
}

test('empty workspace ignores .gitkeep and discovers the first real package', (t) => {
  const root = fixture(t);
  assert.deepEqual(workspaces(root), []);
  mkdirSync(join(root, 'packages/core'));
  writeFileSync(
    join(root, 'packages/core/package.json'),
    JSON.stringify({ name: '@starter-app/core' }),
  );
  assert.deepEqual(workspaces(root), [{ name: '@starter-app/core', path: 'packages/core' }]);
});

test('a package directory without its manifest fails instead of being silently skipped', (t) => {
  const root = fixture(t);
  mkdirSync(join(root, 'apps/broken'));
  assert.throws(() => workspaces(root), /package.json/);
});

test('peer and optional dependents participate in transitive selection', () => {
  const packages = [
    { name: '@starter-app/core', path: 'packages/core' },
    {
      name: '@starter-app/plugin',
      path: 'packages/plugin',
      peerDependencies: { '@starter-app/core': 'workspace:*' },
    },
    {
      name: '@starter-app/web',
      path: 'apps/web',
      optionalDependencies: { '@starter-app/plugin': 'workspace:*' },
    },
  ];
  assert.equal(affectedPackages(packages, ['packages/core/src/deleted.ts']).length, 3);
});
