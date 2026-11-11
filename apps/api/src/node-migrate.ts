import { lstatSync, mkdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

import {
  applyMigrations,
  loadMigrations,
} from './infrastructure/sqlite/migrations.ts';

if (process.argv.length !== 2) {
  throw new Error('The local migration command does not accept arguments');
}

const directory = fileURLToPath(new URL('../.local/', import.meta.url));
const filename = fileURLToPath(
  new URL('../.local/rent-hub.sqlite', import.meta.url),
);

if (lstatSync(directory, { throwIfNoEntry: false })?.isSymbolicLink()) {
  throw new Error('The local database directory must not be a symbolic link');
}

mkdirSync(directory, { recursive: true });

if (lstatSync(filename, { throwIfNoEntry: false })?.isSymbolicLink()) {
  throw new Error('The local database file must not be a symbolic link');
}

const database = new DatabaseSync(filename);

try {
  applyMigrations(database, loadMigrations());
  console.info('Local database migrations applied.');
} finally {
  database.close();
}
