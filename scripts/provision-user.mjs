import { scrypt as scryptCallback, randomBytes } from 'node:crypto';
import { promisify } from 'node:util';
import { createInterface } from 'node:readline/promises';
import process from 'node:process';
import path from 'node:path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const scrypt = promisify(scryptCallback);
const args = new Map(process.argv.slice(2).map((value, index, all) => value.startsWith('--') ? [value.slice(2), all[index + 1]] : null).filter(Boolean));
const role = args.get('role');
const email = args.get('email');
const name = args.get('name');

if (!['company', 'region'].includes(role) || !email || !name) {
  console.error('Usage: npm run provision:user -- --role company|region --email user@example.com --name "Organization"');
  process.exit(1);
}

const terminal = createInterface({ input: process.stdin, output: process.stdout });
const password = process.env.ATOMPATH_PROVISION_PASSWORD ?? await terminal.question('Temporary password (minimum 8 characters): ');
terminal.close();
if (password.length < 8) {
  console.error('Password must contain at least 8 characters.');
  process.exit(1);
}

const salt = randomBytes(16).toString('hex');
const derived = await scrypt(password, salt, 64);
const passwordHash = `scrypt:${salt}:${Buffer.from(derived).toString('hex')}`;
const db = await open({ filename: process.env.DATABASE_PATH ?? path.resolve('database.db'), driver: sqlite3.Database });

try {
  await db.exec(`
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
    )
  `);
  await db.run(
    `INSERT INTO users (email, password_hash, role, name, current_position, experience, region, skills)
     VALUES (?, ?, ?, ?, '', '', '', '')`,
    [email.toLowerCase(), passwordHash, role, name],
  );
  console.log(`Provisioned ${role} account for ${email}.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Unable to provision account.');
  process.exitCode = 1;
} finally {
  await db.close();
}
