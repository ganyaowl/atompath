'use server';

import { getDb } from '@/lib/db';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function getSessionUserId() {
  const cookieStore = await cookies();
  const userIdStr = cookieStore.get('userId')?.value;
  return userIdStr ? parseInt(userIdStr, 10) : null;
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  if (!email || !password || !role) {
    return { error: 'Заполните все поля' };
  }

  const db = await getDb();
  const user = await db.get(
    'SELECT * FROM users WHERE email = ? AND role = ?',
    [email, role]
  );

  if (!user || user.password !== password) {
    return { error: 'Неверный email, пароль или роль' };
  }

  const cookieStore = await cookies();
  cookieStore.set('userId', user.id.toString(), {
    path: '/',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  redirect('/dashboard');
}

export async function register(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;
  const name = formData.get('name') as string;
  
  // Resident fields
  const currentPosition = formData.get('currentPosition') as string || '';
  const experience = formData.get('experience') as string || '';
  const region = formData.get('region') as string || '';
  const skills = formData.get('skills') as string || '';

  if (!email || !password || !role || !name) {
    return { error: 'Заполните основные поля' };
  }

  const db = await getDb();
  
  try {
    const result = await db.run(
      `INSERT INTO users (email, password, role, name, current_position, experience, region, skills) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [email, password, role, name, currentPosition, experience, region, skills]
    );

    const cookieStore = await cookies();
    if (result.lastID) {
      cookieStore.set('userId', result.lastID.toString(), {
        path: '/',
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7,
      });
    }
  } catch (err: any) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return { error: 'Пользователь с таким email уже существует' };
    }
    return { error: 'Ошибка регистрации: ' + err.message };
  }

  redirect('/dashboard');
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('userId');
  redirect('/');
}

export async function getCurrentUser() {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const db = await getDb();
  const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
  return user || null;
}

export async function updateProfile(formData: FormData) {
  const userId = await getSessionUserId();
  if (!userId) return { error: 'Не авторизован' };

  const name = formData.get('name') as string;
  const currentPosition = formData.get('currentPosition') as string;
  const experience = formData.get('experience') as string;
  const region = formData.get('region') as string;
  const skills = formData.get('skills') as string;

  const db = await getDb();
  await db.run(
    `UPDATE users SET name = ?, current_position = ?, experience = ?, region = ?, skills = ? WHERE id = ?`,
    [name, currentPosition, experience, region, skills, userId]
  );

  return { success: true };
}

export async function enrollCourse(courseId: number) {
  const userId = await getSessionUserId();
  if (!userId) return { error: 'Не авторизован' };

  const db = await getDb();
  
  // Check if already enrolled
  const existing = await db.get(
    'SELECT * FROM user_courses WHERE user_id = ? AND course_id = ?',
    [userId, courseId]
  );

  if (existing) {
    // Increment progress by 10% or complete it
    const newProgress = Math.min((existing.progress || 0) + 15, 100);
    await db.run(
      'UPDATE user_courses SET progress = ? WHERE user_id = ? AND course_id = ?',
      [newProgress, userId, courseId]
    );
  } else {
    // Start course with 15% progress
    await db.run(
      'INSERT INTO user_courses (user_id, course_id, progress) VALUES (?, ?, ?)',
      [userId, courseId, 15]
    );
  }

  return { success: true };
}

export async function applyInternship(internshipId: number) {
  const userId = await getSessionUserId();
  if (!userId) return { error: 'Не авторизован' };

  const db = await getDb();
  
  // Check if already applied
  const existing = await db.get(
    'SELECT * FROM applications WHERE user_id = ? AND internship_id = ?',
    [userId, internshipId]
  );

  if (!existing) {
    await db.run(
      'INSERT INTO applications (user_id, internship_id, status) VALUES (?, ?, ?)',
      [userId, internshipId, 'Заявка подана']
    );
  }

  return { success: true };
}

export async function addProfession(formData: FormData) {
  const userId = await getSessionUserId();
  if (!userId) return { error: 'Не авторизован' };

  const title = formData.get('title') as string;
  const requirements = formData.get('requirements') as string;
  const salaryGrowth = formData.get('salaryGrowth') as string;
  const transitionTime = formData.get('transitionTime') as string;

  if (!title || !requirements) {
    return { error: 'Заполните название и требования' };
  }

  const db = await getDb();
  await db.run(
    'INSERT INTO professions (title, requirements, salary_growth, transition_time) VALUES (?, ?, ?, ?)',
    [title, requirements, salaryGrowth || '+25%', transitionTime || '6 месяцев']
  );

  return { success: true };
}

export async function addInternship(formData: FormData) {
  const userId = await getSessionUserId();
  if (!userId) return { error: 'Не авторизован' };

  const title = formData.get('title') as string;
  const company = formData.get('company') as string;
  const location = formData.get('location') as string;
  const matchPct = parseInt(formData.get('matchPct') as string || '80', 10);

  if (!title || !company || !location) {
    return { error: 'Заполните название, компанию и место' };
  }

  const db = await getDb();
  await db.run(
    'INSERT INTO internships (title, company, location, match_pct, company_id) VALUES (?, ?, ?, ?, ?)',
    [title, company, location, matchPct, userId]
  );

  return { success: true };
}

export async function updateDemand(formData: FormData) {
  const userId = await getSessionUserId();
  if (!userId) return { error: 'Не авторизован' };

  const year = formData.get('year') as string;
  const automation = parseInt(formData.get('automation') as string || '0', 10);
  const safety = parseInt(formData.get('safety') as string || '0', 10);
  const digital = parseInt(formData.get('digital') as string || '0', 10);
  const nuclear = parseInt(formData.get('nuclear') as string || '0', 10);

  if (!year) {
    return { error: 'Заполните год' };
  }

  const db = await getDb();
  await db.run(
    `INSERT INTO demands (year, automation, safety, digital, nuclear) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(year) DO UPDATE SET 
     automation = excluded.automation,
     safety = excluded.safety,
     digital = excluded.digital,
     nuclear = excluded.nuclear`,
    [year, automation, safety, digital, nuclear]
  );

  return { success: true };
}

export async function getProfessions() {
  const db = await getDb();
  return await db.all('SELECT * FROM professions');
}

export async function getCoursesList() {
  const userId = await getSessionUserId();
  const db = await getDb();
  
  if (!userId) {
    const list = await db.all('SELECT * FROM courses');
    return list.map(c => ({ ...c, progress: 0 }));
  }

  const list = await db.all(`
    SELECT c.*, IFNULL(uc.progress, 0) as progress 
    FROM courses c
    LEFT JOIN user_courses uc ON uc.course_id = c.id AND uc.user_id = ?
  `, [userId]);

  return list;
}

export async function getInternshipsList() {
  const userId = await getSessionUserId();
  const db = await getDb();

  if (!userId) {
    const list = await db.all('SELECT * FROM internships');
    return list.map(i => ({ ...i, applied: false, appStatus: '' }));
  }

  const list = await db.all(`
    SELECT i.*, 
           CASE WHEN a.id IS NOT NULL THEN 1 ELSE 0 END as applied,
           IFNULL(a.status, '') as appStatus
    FROM internships i
    LEFT JOIN applications a ON a.internship_id = i.id AND a.user_id = ?
  `, [userId]);

  return list;
}

export async function getDemands() {
  const db = await getDb();
  return await db.all('SELECT * FROM demands ORDER BY year ASC');
}

export async function getRegionStats() {
  const db = await getDb();
  return await db.all('SELECT * FROM region_stats');
}

export async function getCompanyApplicants() {
  const db = await getDb();
  return await db.all(`
    SELECT a.id as applicationId, a.status as applicationStatus,
           u.name as residentName, u.email as residentEmail, 
           u.current_position as residentPos, u.experience as residentExp,
           u.skills as residentSkills, i.title as internshipTitle
    FROM applications a
    JOIN users u ON u.id = a.user_id
    JOIN internships i ON i.id = a.internship_id
  `);
}

export async function handleApplicationAction(appId: number, action: 'Одобрить' | 'Отклонить') {
  const db = await getDb();
  const status = action === 'Одобрить' ? 'Одобрено' : 'Отклонено';
  await db.run('UPDATE applications SET status = ? WHERE id = ?', [status, appId]);
  return { success: true };
}
