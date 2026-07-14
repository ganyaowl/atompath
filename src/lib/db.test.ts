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

  it('scopes internships, applicants, and application decisions to one employer', async () => {
    const { getDb } = await import('./db');
    const { getEmployerApplicants, getEmployerInternships, updateEmployerApplication } = await import('./employer-data');
    const db = await getDb();

    const firstEmployer = await db.run(
      "INSERT INTO users (email, role, name) VALUES ('first-employer@example.com', 'company', 'Первый работодатель')",
    );
    const secondEmployer = await db.run(
      "INSERT INTO users (email, role, name) VALUES ('second-employer@example.com', 'company', 'Второй работодатель')",
    );
    const resident = await db.run(
      "INSERT INTO users (email, role, name) VALUES ('ownership-resident@example.com', 'resident', 'Кандидат')",
    );
    const firstInternship = await db.run(
      "INSERT INTO internships (title, company, location, company_id) VALUES ('Стажировка A', 'Первый работодатель', 'Ташкент', ?)",
      firstEmployer.lastID,
    );
    const secondInternship = await db.run(
      "INSERT INTO internships (title, company, location, company_id) VALUES ('Стажировка B', 'Второй работодатель', 'Самарканд', ?)",
      secondEmployer.lastID,
    );
    const firstApplication = await db.run(
      'INSERT INTO applications (user_id, internship_id) VALUES (?, ?)',
      [resident.lastID, firstInternship.lastID],
    );
    const secondApplication = await db.run(
      'INSERT INTO applications (user_id, internship_id) VALUES (?, ?)',
      [resident.lastID, secondInternship.lastID],
    );

    const internships = await getEmployerInternships(firstEmployer.lastID!);
    const applicants = await getEmployerApplicants(firstEmployer.lastID!);
    expect(internships.map((item: { title: string }) => item.title)).toContain('Стажировка A');
    expect(internships.map((item: { title: string }) => item.title)).not.toContain('Стажировка B');
    expect(applicants).toHaveLength(1);

    const forbiddenUpdate = await updateEmployerApplication(firstEmployer.lastID!, secondApplication.lastID!, 'Одобрено');
    expect(forbiddenUpdate.changes).toBe(0);
    const allowedUpdate = await updateEmployerApplication(firstEmployer.lastID!, firstApplication.lastID!, 'Одобрено');
    expect(allowedUpdate.changes).toBe(1);
  });
});
