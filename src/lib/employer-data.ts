import 'server-only';

import { getDb } from './db';

export async function getEmployerInternships(employerId: number) {
  return (await getDb()).all(
    'SELECT * FROM internships WHERE company_id = ? ORDER BY id DESC',
    employerId,
  );
}

export async function getEmployerApplicants(employerId: number) {
  return (await getDb()).all(`
    SELECT a.id applicationId, a.status applicationStatus, u.name residentName,
           u.email residentEmail, u.current_position residentPos, u.experience residentExp,
           u.skills residentSkills, i.title internshipTitle
    FROM applications a JOIN users u ON u.id = a.user_id
    JOIN internships i ON i.id = a.internship_id
    WHERE i.company_id = ? ORDER BY a.created_at DESC
  `, employerId);
}

export async function updateEmployerApplication(
  employerId: number,
  applicationId: number,
  status: 'Одобрено' | 'Отклонено',
) {
  return (await getDb()).run(
    `UPDATE applications SET status = ? WHERE id = ? AND internship_id IN
     (SELECT id FROM internships WHERE company_id = ?)`,
    [status, applicationId, employerId],
  );
}
