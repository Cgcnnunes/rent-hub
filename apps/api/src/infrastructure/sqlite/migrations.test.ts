import { DatabaseSync } from 'node:sqlite';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { applyMigrations, loadMigrations } from './migrations.ts';

describe('local account migrations', () => {
  let database: DatabaseSync;

  beforeEach(() => {
    database = new DatabaseSync(':memory:', {
      enableForeignKeyConstraints: false,
    });
  });

  afterEach(() => {
    database.close();
  });

  it('applies migrations atomically and can be run again without losing data', () => {
    const migrations = loadMigrations();
    applyMigrations(database, migrations);
    database.exec("INSERT INTO users (id) VALUES ('owner')");
    database.exec(`
      BEGIN;
      INSERT INTO accounts (id, owner_user_id) VALUES ('account', 'owner');
      INSERT INTO account_memberships (account_id, user_id) VALUES ('account', 'owner');
      COMMIT;
    `);

    applyMigrations(database, migrations);

    expect(database.prepare('SELECT id FROM accounts').all()).toEqual([
      { id: 'account' },
    ]);
    expect(
      database.prepare('SELECT name FROM schema_migrations').all(),
    ).toHaveLength(migrations.length);
  });

  it('rejects altered, removed, or out-of-order applied migrations', () => {
    const migrations = loadMigrations();
    applyMigrations(database, migrations);

    expect(() =>
      applyMigrations(database, [{ ...migrations[0], checksum: 'changed' }]),
    ).toThrow('Applied migration is missing, reordered, or changed');
    expect(() => applyMigrations(database, [])).toThrow(
      'Applied migration is missing, reordered, or changed',
    );
    expect(() =>
      applyMigrations(database, [
        { checksum: 'new', name: '0000_earlier.sql', sql: 'SELECT 1;' },
        ...migrations,
      ]),
    ).toThrow('Applied migration is missing, reordered, or changed');
  });

  it('rolls back both schema and migration ledger when a migration fails', () => {
    expect(() =>
      applyMigrations(database, [
        ...loadMigrations(),
        { checksum: 'invalid', name: '0002_invalid.sql', sql: 'INVALID SQL;' },
      ]),
    ).toThrow();

    const tables = database
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
      .all();

    expect(tables).toEqual([]);
  });

  it('enforces owner membership, account isolation and valid access levels', () => {
    applyMigrations(database, loadMigrations());
    database.exec("INSERT INTO users (id) VALUES ('owner'), ('member')");
    database.exec(`
      BEGIN;
      INSERT INTO accounts (id, owner_user_id) VALUES ('first', 'owner');
      INSERT INTO account_memberships (account_id, user_id) VALUES ('first', 'owner');
      INSERT INTO accounts (id, owner_user_id) VALUES ('second', 'owner');
      INSERT INTO account_memberships (account_id, user_id) VALUES ('second', 'owner');
      INSERT INTO account_memberships (account_id, user_id) VALUES ('first', 'member');
      COMMIT;
    `);

    expect(() =>
      database.exec(
        "INSERT INTO membership_area_access VALUES ('second', 'member', 'payments', 'viewer')",
      ),
    ).toThrow();
    expect(() =>
      database.exec(
        "INSERT INTO membership_area_access VALUES ('first', 'member', 'payments', 'admin')",
      ),
    ).toThrow();

    database.exec(
      "INSERT INTO membership_area_access VALUES ('first', 'member', 'payments', 'viewer')",
    );

    expect(() =>
      database.exec(
        "DELETE FROM account_memberships WHERE account_id = 'first' AND user_id = 'member'",
      ),
    ).toThrow();
    expect(() =>
      database.exec(
        "DELETE FROM account_memberships WHERE account_id = 'first' AND user_id = 'owner'",
      ),
    ).toThrow();
    expect(() =>
      database.exec(
        "INSERT INTO accounts (id, owner_user_id) VALUES ('missing-owner-membership', 'owner')",
      ),
    ).toThrow();
    expect(() =>
      database.exec(
        "INSERT INTO account_memberships (account_id, user_id) VALUES ('first', 'owner')",
      ),
    ).toThrow();
  });
});
