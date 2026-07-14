import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

// Singleton connection to prevent multiple connections during HMR
let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = path.resolve(process.cwd(), 'database.db');
  
  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable foreign keys
  await dbInstance.run('PRAGMA foreign_keys = ON');

  // Initialize schema
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT,
      name TEXT,
      current_position TEXT,
      experience TEXT,
      region TEXT,
      skills TEXT
    );

    CREATE TABLE IF NOT EXISTS professions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      requirements TEXT,
      salary_growth TEXT,
      transition_time TEXT
    );

    CREATE TABLE IF NOT EXISTS internships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      company TEXT,
      location TEXT,
      match_pct INTEGER,
      company_id INTEGER
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      internship_id INTEGER,
      status TEXT DEFAULT 'В рассмотрении'
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      duration TEXT,
      provider TEXT
    );

    CREATE TABLE IF NOT EXISTS user_courses (
      user_id INTEGER,
      course_id INTEGER,
      progress INTEGER DEFAULT 0,
      PRIMARY KEY (user_id, course_id)
    );

    CREATE TABLE IF NOT EXISTS demands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year TEXT UNIQUE,
      automation INTEGER,
      safety INTEGER,
      digital INTEGER,
      nuclear INTEGER
    );

    CREATE TABLE IF NOT EXISTS region_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      district TEXT UNIQUE,
      skill_gap TEXT,
      trained INTEGER,
      employed INTEGER
    );
  `);

  // Seed default data if empty
  const usersCount = await dbInstance.get('SELECT COUNT(*) as count FROM users');
  const professionsCount = await dbInstance.get('SELECT COUNT(*) as count FROM professions');
  const internshipsCount = await dbInstance.get('SELECT COUNT(*) as count FROM internships');
  const coursesCount = await dbInstance.get('SELECT COUNT(*) as count FROM courses');
  const demandsCount = await dbInstance.get('SELECT COUNT(*) as count FROM demands');
  const regionStatsCount = await dbInstance.get('SELECT COUNT(*) as count FROM region_stats');

  if (professionsCount?.count === 0) {
    await dbInstance.run(
      `INSERT INTO professions (title, requirements, salary_growth, transition_time) VALUES 
       ('Техник промышленной автоматизации', 'Программирование ПЛК,Промышленная автоматизация,Цифровая диагностика', '+34%', '8–12 месяцев'),
       ('Специалист по обслуживанию ядерного оборудования', 'Промышленная безопасность,Чтение чертежей,Сварка,Электрические системы', '+41%', '10–14 месяцев'),
       ('Инженер по инспекции инфраструктуры', 'Чтение чертежей,Технический чертеж,Промышленная автоматизация', '+52%', '12–18 месяцев')`
    );
  }

  if (internshipsCount?.count === 0) {
    await dbInstance.run(
      `INSERT INTO internships (title, company, location, match_pct, company_id) VALUES 
       ('Стажер-техник по автоматизации', 'Центр ядерных операций', 'Атомный регион', 92, 0),
       ('Стажер по промышленному обслуживанию', 'Региональная электростанция', 'Атомный регион', 87, 0),
       ('Помощник по цифровой инфраструктуре', 'Промышленные тех. решения', 'Удаленно / Гибрид', 84, 0)`
    );
  }

  if (coursesCount?.count === 0) {
    await dbInstance.run(
      `INSERT INTO courses (title, duration, provider) VALUES 
       ('Основы промышленных ПЛК', '6 недель', 'Региональный учебный центр'),
       ('Цифровое промышленное обслуживание', '8 недель', 'Технический университет'),
       ('Стандарты безопасности в автоматизации', '4 недели', 'Институт безопасности')`
    );
  }

  if (demandsCount?.count === 0) {
    await dbInstance.run(
      `INSERT INTO demands (year, automation, safety, digital, nuclear) VALUES 
       ('2025', 1200, 800, 600, 950),
       ('2026', 1800, 1100, 1000, 1200),
       ('2027', 2600, 1500, 1600, 1650),
       ('2028', 3400, 2000, 2400, 2100),
       ('2029', 4200, 2600, 3200, 2800)`
    );
  }

  if (regionStatsCount?.count === 0) {
    await dbInstance.run(
      `INSERT INTO region_stats (district, skill_gap, trained, employed) VALUES 
       ('Северный район', 'Программирование ПЛК (60%), Промышленная автоматизация (40%)', 120, 95),
       ('Центральный район', 'Цифровая диагностика (75%), Технический английский (30%)', 250, 180),
       ('Западный район', 'Промышленная безопасность (50%)', 90, 70),
       ('Восточный район', 'Чтение чертежей (45%), Электрические системы (35%)', 140, 110)`
    );
  }

  return dbInstance;
}
