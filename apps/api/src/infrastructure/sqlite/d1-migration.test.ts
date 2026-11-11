import { Miniflare } from 'miniflare';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { loadMigrations } from './migrations.ts';

describe('account schema in local D1', () => {
  let worker: Miniflare;

  beforeAll(async () => {
    worker = new Miniflare({
      compatibilityDate: '2026-07-30',
      d1Databases: ['DB'],
      modules: true,
      script: 'export default { fetch() { return new Response("ok") } }',
    });

    await worker.ready;
  }, 30_000);

  afterAll(async () => {
    await worker?.dispose();
  });

  it('enforces owner membership and account-scoped access in D1', async () => {
    const database = await worker.getD1Database('DB');
    const statements = loadMigrations()[0]
      .sql.split(';')
      .map((statement) => statement.trim())
      .filter(Boolean);

    await database.batch(
      statements.map((statement) => database.prepare(statement)),
    );
    await database.batch([
      database.prepare("INSERT INTO users (id) VALUES ('owner'), ('member')"),
      database.prepare(
        "INSERT INTO accounts (id, owner_user_id) VALUES ('first', 'owner')",
      ),
      database.prepare(
        "INSERT INTO account_memberships (account_id, user_id) VALUES ('first', 'owner')",
      ),
      database.prepare(
        "INSERT INTO accounts (id, owner_user_id) VALUES ('second', 'owner')",
      ),
      database.prepare(
        "INSERT INTO account_memberships (account_id, user_id) VALUES ('second', 'owner'), ('first', 'member')",
      ),
    ]);

    await expect(
      database
        .prepare(
          "INSERT INTO membership_area_access VALUES ('second', 'member', 'payments', 'viewer')",
        )
        .run(),
    ).rejects.toThrow();
    await expect(
      database
        .prepare(
          "INSERT INTO accounts (id, owner_user_id) VALUES ('third', 'owner')",
        )
        .run(),
    ).rejects.toThrow();
    await expect(
      database
        .prepare(
          "INSERT INTO membership_area_access VALUES ('first', 'member', 'payments', 'admin')",
        )
        .run(),
    ).rejects.toThrow();
  }, 30_000);
});
