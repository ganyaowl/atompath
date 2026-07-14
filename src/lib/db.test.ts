import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

describe('database migrations', () => {
  beforeAll(async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'atompath-db-'));
    process.env.DATABASE_PATH = path.join(directory, 'test.db');
  });

  it('creates and seeds a fresh database idempotently', async () => {
    const { getDb } = await import('./db');
    const first = await getDb();
    const second = await getDb();
    expect(second).toBe(first);

    const migration = await first.get<{ count: number }>('SELECT COUNT(*) count FROM schema_migrations');
    const skills = await first.get<{ count: number }>('SELECT COUNT(*) count FROM skills');
    const links = await first.get<{ count: number }>('SELECT COUNT(*) count FROM profession_skills');
    expect(migration?.count).toBe(1);
    expect(skills?.count).toBeGreaterThanOrEqual(8);
    expect(links?.count).toBeGreaterThan(0);
  });

  it('enforces normalized skill levels', async () => {
    const { getDb } = await import('./db');
    const db = await getDb();
    const skill = await db.get<{ id: number }>('SELECT id FROM skills LIMIT 1');
    await expect(db.run('INSERT INTO profession_skills VALUES (999, ?, 5, 1)', skill!.id)).rejects.toThrow();
  });
});
