import { spawnSync } from 'node:child_process';
import { walk, workspaces } from './workspace.mjs';

const mode = process.argv[2];
if (!['unit', 'e2e'].includes(mode)) throw new Error('Expected unit or e2e');
const files = (mode === 'e2e' ? ['apps'] : ['apps', 'packages']).flatMap(walk);
const tests = files.filter((file) =>
  mode === 'unit' ? /\.test\.tsx?$/.test(file) : /\/e2e\/.*\.spec\.tsx?$/.test(file),
);
const owners = workspaces().filter((pkg) => mode === 'unit' || pkg.path.startsWith('apps/'));
if (tests.length === 0 && owners.length === 0) {
  console.log(`No ${mode} tests: no relevant workspaces exist.`);
} else {
  const args = mode === 'unit' ? ['vitest', 'run'] : ['playwright', 'test'];
  const result = spawnSync('pnpm', ['exec', ...args, ...process.argv.slice(3)], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}
