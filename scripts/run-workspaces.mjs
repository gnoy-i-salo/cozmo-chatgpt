import { spawnSync } from 'node:child_process';
import { workspaces } from './workspace.mjs';

const script = process.argv[2];
if (!script) throw new Error('Usage: node scripts/run-workspaces.mjs <script>');
const packages = workspaces();
const selected =
  script === 'check:rust' ? packages.filter((pkg) => pkg.scripts?.[script]) : packages;
if (selected.length === 0) {
  console.log(`No workspaces with ${script} to run.`);
} else {
  for (const pkg of selected)
    if (!pkg.scripts?.[script]) throw new Error(`${pkg.name}: missing required ${script} script`);
  const result = spawnSync('pnpm', ['-r', '--if-present', script], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}
