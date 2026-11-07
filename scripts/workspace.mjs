import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
export const ignored = new Set([
  'node_modules',
  '.pnpm-store',
  '.git',
  '.cache',
  'target',
  'dist',
  'gen',
  '.beads',
  'coverage',
  'test-results',
  'playwright-report',
]);
export function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (ignored.has(entry.name)) return [];
    const path = join(directory, entry.name).replaceAll('\\', '/');
    return entry.isDirectory() ? walk(path) : [path];
  });
}
export function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}
export function workspaces(root = '.') {
  return ['apps', 'packages'].flatMap((parent) => {
    const directory = join(root, parent);
    if (!existsSync(directory)) return [];
    return readdirSync(directory, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
      .map((entry) => {
        const path = `${parent}/${entry.name}`;
        return { ...readJson(join(root, path, 'package.json')), path };
      });
  });
}
export function affectedPackages(packages, changed) {
  const selected = new Set(
    packages
      .filter((pkg) => changed.some((file) => file.startsWith(`${pkg.path}/`)))
      .map((pkg) => pkg.name),
  );
  let grew = true;
  while (grew) {
    grew = false;
    for (const pkg of packages) {
      if (
        !selected.has(pkg.name) &&
        Object.keys({
          ...pkg.dependencies,
          ...pkg.devDependencies,
          ...pkg.peerDependencies,
          ...pkg.optionalDependencies,
        }).some((dep) => selected.has(dep))
      ) {
        selected.add(pkg.name);
        grew = true;
      }
    }
  }
  return packages.filter((pkg) => selected.has(pkg.name));
}
