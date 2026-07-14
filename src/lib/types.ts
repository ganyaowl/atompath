export type UserRole = 'resident' | 'company' | 'region';

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export interface SessionUser {
  id: number;
  email: string;
  role: UserRole;
  name: string;
  currentPosition: string;
  experience: string;
  region: string;
}

export interface Skill {
  id: number;
  name: string;
  category: string;
  level?: number;
}

export interface SkillGap {
  skillId: number;
  name: string;
  currentLevel: number;
  requiredLevel: number;
  weight: number;
}

export interface ProfessionMatch {
  professionId: number;
  title: string;
  score: number;
  salaryGrowth: string;
  transitionTime: string;
  strengths: string[];
  gaps: SkillGap[];
}

export interface AssessmentResult {
  assessmentId: number;
  completedAt: string;
  matches: ProfessionMatch[];
}

export interface AssessmentDraft {
  currentPosition: string;
  experience: string;
  region: string;
  certifications: string;
  levels: Record<number, number>;
}

export interface CourseRecommendation {
  id: number;
  title: string;
  duration: string;
  provider: string;
  progress: number;
  enrolled: boolean;
  relevanceScore: number;
  addresses: string[];
}

export interface InternshipRecommendation {
  id: number;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  missingSkills: string[];
  applied: boolean;
  applicationStatus: string;
}

export type RoadmapStatus = 'completed' | 'in-progress' | 'upcoming' | 'planned' | 'target';

export interface RoadmapStep {
  step: number;
  title: string;
  description: string;
  status: RoadmapStatus;
}

export interface ResidentDashboardData {
  user: SessionUser;
  skills: Skill[];
  hasCompletedAssessment: boolean;
  assessment: AssessmentResult | null;
  selectedProfession: ProfessionMatch | null;
  courses: CourseRecommendation[];
  internships: InternshipRecommendation[];
  readiness: number;
  roadmap: RoadmapStep[];
}
