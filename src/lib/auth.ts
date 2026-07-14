import 'server-only';

import { createHash, randomBytes } from 'node:crypto';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import type { SessionUser, UserRole } from '@/lib/types';

const COOKIE_NAME = 'atompath_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function tokenHash(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export const getSession = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  const db = await getDb();
  const row = await db.get<{
    id: number;
    email: string;
    role: UserRole;
    name: string;
    current_position: string;
    experience: string;
    region: string;
  }>(`
    SELECT u.id, u.email, u.role, u.name, u.current_position, u.experience, u.region
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ? AND datetime(s.expires_at) > CURRENT_TIMESTAMP
  `, tokenHash(token));

  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    name: row.name,
    currentPosition: row.current_position,
    experience: row.experience,
    region: row.region,
  };
});

export async function createSession(userId: number): Promise<void> {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
  const db = await getDb();
  await db.run('DELETE FROM sessions WHERE datetime(expires_at) <= CURRENT_TIMESTAMP');
  await db.run(
    'INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)',
    [tokenHash(token), userId, expiresAt.toISOString()],
  );

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    const db = await getDb();
    await db.run('DELETE FROM sessions WHERE token_hash = ?', tokenHash(token));
  }
  cookieStore.delete(COOKIE_NAME);
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) throw new Error('Unauthorized');
  return user;
}

export async function requireRole(role: UserRole): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== role) throw new Error('Forbidden');
  return user;
}

export async function requireAnyRole(roles: readonly UserRole[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) throw new Error('Forbidden');
  return user;
}
