import 'server-only';

import path from 'node:path';
import sqlite3 from 'sqlite3';
import { open, type Database } from 'sqlite';
import { hashPassword } from './password';

let dbInstance: Database | null = null;

async function hasColumn(db: Database, table: string, column: string): Promise<boolean> {
  const columns = await db.all<{ name: string }[]>(`PRAGMA table_info(${table})`);
  return columns.some((item) => item.name === column);
}

async function migrate(db: Database): Promise<void> {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password TEXT,
      password_hash TEXT,
      role TEXT NOT NULL CHECK (role IN ('resident', 'company', 'region')),
      name TEXT NOT NULL,
      current_position TEXT NOT NULL DEFAULT '',
      experience TEXT NOT NULL DEFAULT '',
      region TEXT NOT NULL DEFAULT '',
      skills TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS professions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL UNIQUE,
      requirements TEXT NOT NULL DEFAULT '',
      salary_growth TEXT NOT NULL DEFAULT '',
      transition_time TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS internships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT NOT NULL,
      match_pct INTEGER NOT NULL DEFAULT 0 CHECK (match_pct BETWEEN 0 AND 100),
      company_id INTEGER REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      internship_id INTEGER NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'Заявка подана' CHECK (status IN ('Заявка подана', 'Одобрено', 'Отклонено')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, internship_id)
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL UNIQUE,
      duration TEXT NOT NULL,
      provider TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_courses (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
      PRIMARY KEY (user_id, course_id)
    );

    CREATE TABLE IF NOT EXISTS demands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year TEXT NOT NULL UNIQUE,
      automation INTEGER NOT NULL DEFAULT 0,
      safety INTEGER NOT NULL DEFAULT 0,
      digital INTEGER NOT NULL DEFAULT 0,
      nuclear INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS region_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      district TEXT NOT NULL UNIQUE,
      skill_gap TEXT NOT NULL,
      trained INTEGER NOT NULL DEFAULT 0,
      employed INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token_hash TEXT NOT NULL UNIQUE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1))
    );

    CREATE TABLE IF NOT EXISTS profession_skills (
      profession_id INTEGER NOT NULL REFERENCES professions(id) ON DELETE CASCADE,
      skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
      required_level INTEGER NOT NULL CHECK (required_level BETWEEN 1 AND 4),
      weight REAL NOT NULL CHECK (weight > 0),
      PRIMARY KEY (profession_id, skill_id)
    );

    CREATE TABLE IF NOT EXISTS assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status TEXT NOT NULL CHECK (status IN ('draft', 'completed')),
      current_position TEXT NOT NULL DEFAULT '',
      experience TEXT NOT NULL DEFAULT '',
      region TEXT NOT NULL DEFAULT '',
      certifications TEXT NOT NULL DEFAULT '',
      completed_at TEXT,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS assessment_responses (
      assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
      skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
      level INTEGER NOT NULL CHECK (level BETWEEN 0 AND 4),
      PRIMARY KEY (assessment_id, skill_id)
    );

    CREATE TABLE IF NOT EXISTS user_pathways (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      profession_id INTEGER NOT NULL REFERENCES professions(id) ON DELETE CASCADE,
      selected_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS course_skills (
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
      coverage REAL NOT NULL DEFAULT 1 CHECK (coverage > 0),
      PRIMARY KEY (course_id, skill_id)
    );

    CREATE TABLE IF NOT EXISTS internship_skills (
      internship_id INTEGER NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
      skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
      required_level INTEGER NOT NULL CHECK (required_level BETWEEN 1 AND 4),
      weight REAL NOT NULL DEFAULT 1 CHECK (weight > 0),
      PRIMARY KEY (internship_id, skill_id)
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);
    CREATE INDEX IF NOT EXISTS idx_assessments_user ON assessments(user_id, status, updated_at);
    CREATE INDEX IF NOT EXISTS idx_applications_internship ON applications(internship_id);
  `);

  if (!(await hasColumn(db, 'users', 'password_hash'))) {
    await db.exec('ALTER TABLE users ADD COLUMN password_hash TEXT');
  }
  if (!(await hasColumn(db, 'applications', 'created_at'))) {
    await db.exec("ALTER TABLE applications ADD COLUMN created_at TEXT NOT NULL DEFAULT ''");
  }

  await db.run('INSERT OR IGNORE INTO schema_migrations(version) VALUES (1)');
  await migrateLegacyPasswords(db);
  await seedReferenceData(db);
}

async function migrateLegacyPasswords(db: Database): Promise<void> {
  const users = await db.all<{ id: number; password: string }[]>(
    "SELECT id, password FROM users WHERE (password_hash IS NULL OR password_hash = '') AND password IS NOT NULL AND password != ''",
  );
  for (const user of users) {
    await db.run(
      'UPDATE users SET password_hash = ?, password = NULL WHERE id = ?',
      [await hashPassword(user.password), user.id],
    );
  }
}

async function seedReferenceData(db: Database): Promise<void> {
  await db.exec(`
    INSERT OR IGNORE INTO demands (year, automation, safety, digital, nuclear) VALUES
      ('2025', 1200, 800, 600, 950), ('2026', 1800, 1100, 1000, 1200),
      ('2027', 2600, 1500, 1600, 1650), ('2028', 3400, 2000, 2400, 2100),
      ('2029', 4200, 2600, 3200, 2800);

    INSERT OR IGNORE INTO region_stats (district, skill_gap, trained, employed) VALUES
      ('Северный район', 'Программирование ПЛК (60%), Промышленная автоматизация (40%)', 120, 95),
      ('Центральный район', 'Цифровая диагностика (75%), Технический английский (30%)', 250, 180),
      ('Западный район', 'Промышленная безопасность (50%)', 90, 70),
      ('Восточный район', 'Чтение чертежей (45%), Электрические системы (35%)', 140, 110);

    INSERT OR IGNORE INTO skills (name, category) VALUES
      ('Программирование ПЛК', 'Цифровые технологии'),
      ('Промышленная автоматизация', 'Инженерные навыки'),
      ('Цифровая диагностика', 'Цифровые технологии'),
      ('Технический английский', 'Коммуникация'),
      ('Промышленная безопасность', 'Безопасность'),
      ('Чтение чертежей', 'Инженерные навыки'),
      ('Сварка', 'Практические навыки'),
      ('Электрические системы', 'Инженерные навыки');
  `);

  const professionCount = await db.get<{ count: number }>('SELECT COUNT(*) count FROM professions');
  if (professionCount?.count === 0) {
    await db.exec(`INSERT INTO professions (title, requirements, salary_growth, transition_time) VALUES
      ('Техник промышленной автоматизации', 'Программирование ПЛК,Промышленная автоматизация,Цифровая диагностика', '+34%', '8–12 месяцев'),
      ('Специалист по обслуживанию ядерного оборудования', 'Промышленная безопасность,Чтение чертежей,Сварка,Электрические системы', '+41%', '10–14 месяцев'),
      ('Инженер по инспекции инфраструктуры', 'Чтение чертежей,Технический английский,Цифровая диагностика', '+52%', '12–18 месяцев')`);
  }

  const courseCount = await db.get<{ count: number }>('SELECT COUNT(*) count FROM courses');
  if (courseCount?.count === 0) {
    await db.exec(`INSERT INTO courses (title, duration, provider) VALUES
      ('Основы промышленных ПЛК', '6 недель', 'Региональный учебный центр'),
      ('Цифровое промышленное обслуживание', '8 недель', 'Технический университет'),
      ('Стандарты безопасности в автоматизации', '4 недели', 'Институт безопасности')`);
  }

  const internshipCount = await db.get<{ count: number }>('SELECT COUNT(*) count FROM internships');
  if (internshipCount?.count === 0) {
    await db.exec(`
      INSERT INTO internships (title, company, location, match_pct, company_id) VALUES
        ('Стажер-техник по автоматизации', 'Центр ядерных операций', 'Атомный регион', 92, NULL),
        ('Стажер по промышленному обслуживанию', 'Региональная электростанция', 'Атомный регион', 87, NULL),
        ('Помощник по цифровой инфраструктуре', 'Промышленные тех. решения', 'Удаленно / Гибрид', 84, NULL);
    `);
  }

  const skill = async (name: string) => (await db.get<{ id: number }>('SELECT id FROM skills WHERE name = ?', name))!.id;
  const profession = async (title: string) => (await db.get<{ id: number }>('SELECT id FROM professions WHERE title = ?', title))!.id;
  const course = async (title: string) => (await db.get<{ id: number }>('SELECT id FROM courses WHERE title = ?', title))!.id;

  const professionLinks: Array<[string, string, number, number]> = [
    ['Техник промышленной автоматизации', 'Программирование ПЛК', 3, 1.5],
    ['Техник промышленной автоматизации', 'Промышленная автоматизация', 3, 1.5],
    ['Техник промышленной автоматизации', 'Цифровая диагностика', 2, 1],
    ['Техник промышленной автоматизации', 'Промышленная безопасность', 2, 0.8],
    ['Специалист по обслуживанию ядерного оборудования', 'Промышленная безопасность', 4, 1.5],
    ['Специалист по обслуживанию ядерного оборудования', 'Чтение чертежей', 3, 1],
    ['Специалист по обслуживанию ядерного оборудования', 'Сварка', 3, 1],
    ['Специалист по обслуживанию ядерного оборудования', 'Электрические системы', 2, 1],
    ['Инженер по инспекции инфраструктуры', 'Чтение чертежей', 3, 1.5],
    ['Инженер по инспекции инфраструктуры', 'Технический английский', 2, 0.8],
    ['Инженер по инспекции инфраструктуры', 'Цифровая диагностика', 3, 1.2],
    ['Инженер по инспекции инфраструктуры', 'Промышленная безопасность', 2, 1],
  ];
  for (const [professionName, skillName, level, weight] of professionLinks) {
    await db.run(
      'INSERT OR IGNORE INTO profession_skills VALUES (?, ?, ?, ?)',
      [await profession(professionName), await skill(skillName), level, weight],
    );
  }

  const courseLinks: Array<[string, string, number]> = [
    ['Основы промышленных ПЛК', 'Программирование ПЛК', 1.5],
    ['Основы промышленных ПЛК', 'Промышленная автоматизация', 1],
    ['Цифровое промышленное обслуживание', 'Цифровая диагностика', 1.5],
    ['Цифровое промышленное обслуживание', 'Электрические системы', 0.8],
    ['Стандарты безопасности в автоматизации', 'Промышленная безопасность', 1.5],
    ['Стандарты безопасности в автоматизации', 'Промышленная автоматизация', 0.6],
  ];
  for (const [courseName, skillName, coverage] of courseLinks) {
    await db.run(
      'INSERT OR IGNORE INTO course_skills VALUES (?, ?, ?)',
      [await course(courseName), await skill(skillName), coverage],
    );
  }

  const internships = await db.all<{ id: number; title: string }[]>('SELECT id, title FROM internships');
  for (const item of internships) {
    const mappings = item.title.includes('автоматизации')
      ? [['Программирование ПЛК', 2, 1.5], ['Промышленная автоматизация', 2, 1]] as const
      : item.title.includes('обслуживанию')
        ? [['Промышленная безопасность', 3, 1.5], ['Электрические системы', 2, 1]] as const
        : [['Цифровая диагностика', 2, 1.5], ['Технический английский', 1, 0.5]] as const;
    for (const [skillName, level, weight] of mappings) {
      await db.run('INSERT OR IGNORE INTO internship_skills VALUES (?, ?, ?, ?)', [item.id, await skill(skillName), level, weight]);
    }
  }
}

export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  const filename = process.env.DATABASE_PATH ?? path.resolve(process.cwd(), 'database.db');
  const db = await open({ filename, driver: sqlite3.Database });
  await db.run('PRAGMA foreign_keys = ON');
  await db.run('PRAGMA journal_mode = WAL');
  await migrate(db);
  dbInstance = db;
  return db;
}
