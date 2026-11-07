import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, delimiter } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'starter-runners-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const folder of ['apps', 'packages', 'scripts', 'bin']) mkdirSync(join(root, folder));
  for (const file of ['workspace.mjs', 'run-workspaces.mjs', 'run-tests.mjs'])
    copyFileSync(new URL(file, import.meta.url), join(root, 'scripts', file));
  writeFileSync(join(root, 'apps/.gitkeep'), '');
  writeFileSync(join(root, 'packages/.gitkeep'), '');
  writeFileSync(join(root, 'bin/pnpm'), '#!/bin/sh\nexit 7\n', { mode: 0o755 });
  writeFileSync(join(root, 'bin/pnpm.cmd'), '@echo off\r\nexit /b 7\r\n');
  const run = (file, ...args) =>
    spawnSync(process.execPath, [`scripts/${file}.mjs`, ...args], {
      cwd: root,
      encoding: 'utf8',
      env: { ...process.env, PATH: `${join(root, 'bin')}${delimiter}${process.env.PATH ?? ''}` },
    });
  const addPackage = (scripts = {}) => {
    mkdirSync(join(root, 'packages/core/src'), { recursive: true });
    writeFileSync(
      join(root, 'packages/core/package.json'),
      JSON.stringify({ name: '@starter-app/core', scripts }),
    );
  };
  return { run, addPackage };
}

test('empty build, typecheck, unit and browser suites skip explicitly', (t) => {
  const { run } = fixture(t);
  for (const [file, mode] of [
    ['run-workspaces', 'build'],
    ['run-workspaces', 'typecheck'],
    ['run-tests', 'unit'],
    ['run-tests', 'e2e'],
  ]) {
    const result = run(file, mode);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /No /);
  }
});

test('missing build/typecheck scripts are errors once a package exists', (t) => {
  const { run, addPackage } = fixture(t);
  addPackage();
  for (const mode of ['build', 'typecheck']) {
    const result = run('run-workspaces', mode);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /missing required/);
  }
});

test('real runner failures propagate and existing packages cannot use the empty-workspace skip', (t) => {
  const { run, addPackage } = fixture(t);
  addPackage({ build: 'tsc', typecheck: 'tsc --noEmit' });
  assert.equal(run('run-workspaces', 'build').status, 7);
  assert.equal(run('run-workspaces', 'typecheck').status, 7);
  assert.equal(run('run-tests', 'unit').status, 7);
  assert.equal(run('run-tests', 'e2e').status, 7);
});
