import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

export interface Migration {
  name: string;
  sql: string;
  checksum: string;
}

export function loadMigrations(): Migration[] {
  const directory = fileURLToPath(
    new URL('../../../migrations/', import.meta.url),
  );
  const names = readdirSync(directory).sort();
  const numbers = new Set<string>();

  return names.map((name) => {
    const match = /^(\d{4})_[a-z0-9_]+\.sql$/.exec(name);

    if (!match || numbers.has(match[1])) {
      throw new Error(`Invalid or duplicate migration name: ${name}`);
    }

    numbers.add(match[1]);

    const sql = readFileSync(
      new URL(`../../../migrations/${name}`, import.meta.url),
      'utf8',
    ).replace(/\r\n/g, '\n');

    return {
      checksum: createHash('sha256').update(sql).digest('hex'),
      name,
      sql,
    };
  });
}

export function applyMigrations(
  database: DatabaseSync,
  migrations: Migration[],
): void {
  database.exec('PRAGMA foreign_keys = ON');
  database.exec('BEGIN IMMEDIATE');

  try {
    database.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY NOT NULL,
        checksum TEXT NOT NULL
      )
    `);

    const applied = database
      .prepare('SELECT name, checksum FROM schema_migrations ORDER BY name')
      .all();

    for (const [index, row] of applied.entries()) {
      const migration = migrations[index];

      if (
        !migration ||
        row.name !== migration.name ||
        row.checksum !== migration.checksum
      ) {
        throw new Error(
          `Applied migration is missing, reordered, or changed: ${String(row.name)}`,
        );
      }
    }

    const insert = database.prepare(
      'INSERT INTO schema_migrations (name, checksum) VALUES (?, ?)',
    );

    for (const migration of migrations.slice(applied.length)) {
      database.exec(migration.sql);
      insert.run(migration.name, migration.checksum);
    }

    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
}
