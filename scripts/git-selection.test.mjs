import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, delimiter } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'starter-git-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const directory of ['apps', 'packages', 'scripts', 'bin', 'docs'])
    mkdirSync(join(root, directory));
  for (const file of ['check.mjs', 'workspace.mjs'])
    copyFileSync(new URL(file, import.meta.url), join(root, 'scripts', file));
  writeFileSync(join(root, '.gitignore'), 'scripts/\nbin/\ncommands.jsonl\n');
  const git = (...args) => {
    const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
  };
  git('init', '-b', 'trunk');
  git('add', '.gitignore');
  const log = join(root, 'commands.jsonl');
  const runner = join(root, 'bin/runner.cjs');
  writeFileSync(
    runner,
    "require('node:fs').appendFileSync(process.env.STARTER_CHECK_LOG, JSON.stringify(process.argv.slice(2)) + '\\n');\n",
  );
  const quote = (value) => `'${value.replaceAll("'", "'\\''")}'`;
  writeFileSync(
    join(root, 'bin/pnpm'),
    `#!/bin/sh\nexec ${quote(process.execPath)} ${quote(runner)} "$@"\n`,
    { mode: 0o755 },
  );
  writeFileSync(
    join(root, 'bin/pnpm.cmd'),
    `@echo off\r\n"${process.execPath}" "${runner}" %*\r\n`,
  );
  const run = (...args) =>
    spawnSync(process.execPath, ['scripts/check.mjs', ...args], {
      cwd: root,
      encoding: 'utf8',
      env: {
        ...process.env,
        STARTER_CHECK_LOG: log,
        PATH: `${join(root, 'bin')}${delimiter}${process.env.PATH ?? ''}`,
      },
    });
  const commands = () =>
    readFileSync(log, 'utf8')
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line));
  return { root, git, run, commands };
}

test('initial repository without HEAD or origin still validates untracked root changes', (t) => {
  const { run, commands } = fixture(t);
  const result = run('--changed');
  assert.equal(result.status, 0, result.stderr);
  assert.ok(commands().some((command) => command[0] === 'test:harness'));
  assert.ok(commands().some((command) => command[0] === 'build'));
});

test('partial staging fails before any quality command runs', (t) => {
  const { root, git, run } = fixture(t);
  writeFileSync(join(root, 'README.md'), 'Staged\n');
  git('add', 'README.md');
  writeFileSync(join(root, 'README.md'), 'Unstaged\n');
  const result = run('--staged');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Partially staged/);
});

test('an explicit unknown comparison base fails instead of silently reducing coverage', (t) => {
  const { run } = fixture(t);
  const result = run('--changed', 'does-not-exist');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unknown comparison base/);
});
