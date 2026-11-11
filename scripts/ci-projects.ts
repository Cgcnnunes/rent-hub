import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

interface Project {
  name: string;
  root: string;
  targets: Record<string, unknown>;
}

const require = createRequire(import.meta.url);

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

const nx = path.resolve(
  path.dirname(require.resolve('nx/package.json')),
  require('nx/package.json').bin.nx,
);

export function splitProjects(projects: Project[]): {
  apps: { name: string; browser: boolean }[];
  packages: string[];
} {
  const apps: { name: string; browser: boolean }[] = [];

  const packages: string[] = [];

  for (const project of projects) {
    if (project.root.startsWith('apps/')) {
      apps.push({ name: project.name, browser: 'test-e2e' in project.targets });
    } else {
      packages.push(project.name);
    }
  }

  return { apps, packages };
}

export function affectedProjects(
  args: string[] = [],
): ReturnType<typeof splitProjects> {
  const runNx = (command: string[]): string =>
    execFileSync(process.execPath, [nx, ...command], {
      cwd: workspaceRoot,
      encoding: 'utf8',
      env: { ...process.env, NX_DAEMON: 'false' },
    });

  const names: string[] = JSON.parse(
    runNx(['show', 'projects', '--affected', '--json', ...args]),
  );

  const projects: Project[] = names.map((name) => {
    const project: Project = JSON.parse(
      runNx(['show', 'project', name, '--json']),
    );

    if (
      project.name !== name ||
      typeof project.root !== 'string' ||
      !project.targets
    ) {
      throw new Error(`Invalid Nx project metadata for ${name}.`);
    }

    return project;
  });

  return splitProjects(projects);
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const output = process.env.GITHUB_OUTPUT;

  if (!output || !process.env.NX_BASE || !process.env.NX_HEAD) {
    throw new Error('GITHUB_OUTPUT, NX_BASE, and NX_HEAD are required.');
  }

  const { apps, packages } = affectedProjects();

  appendFileSync(
    output,
    `apps=${JSON.stringify(apps)}\npackages=${JSON.stringify(packages)}\n`,
  );
}
