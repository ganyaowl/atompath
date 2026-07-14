export interface NavLink {
  label: string;
  href: string;
}

export interface HowItWorksStep {
  step: number;
  title: string;
  description: string;
  icon: string;
}

export interface CareerTransition {
  currentRole: string;
  futureRole: string;
  transitionTime: string;
  salaryGrowth: string;
  icon: string;
}

export interface ForecastDataPoint {
  year: string;
  automation: number;
  safety: number;
  digital: number;
  nuclear: number;
}

export interface KPIStat {
  value: string;
  label: string;
  icon: string;
}

export interface UserProfile {
  name: string;
  currentPosition: string;
  experience: string;
  region: string;
  skills: string[];
}

export interface SkillGap {
  name: string;
  current: number;
  required: number;
}

export interface RoadmapStep {
  step: number;
  title: string;
  status: 'completed' | 'in-progress' | 'upcoming' | 'planned' | 'target';
  description: string;
}

export interface Course {
  title: string;
  duration: string;
  provider: string;
  progress: number;
}

export interface Internship {
  title: string;
  company: string;
  match: number;
  location: string;
}

export interface DemandDataPoint {
  period: string;
  demand: number | null;
  projected: number;
}

export const navLinks: NavLink[] = [
  { label: 'Как это работает', href: '#how-it-works' },
  { label: 'Карьерные пути', href: '#career-paths' },
  { label: 'Прогноз спроса', href: '#forecast' },
  { label: 'О платформе', href: '#about' },
];

export const howItWorksSteps: HowItWorksStep[] = [
  {
    step: 1,
    title: 'Оценка навыков',
    description: 'Откройте свои сильные стороны. Пройдите комплексную оценку ваших технических навыков, сертификатов и опыта.',
    icon: 'ClipboardCheck',
  },
  {
    step: 2,
    title: 'Подбор карьеры',
    description: 'Найдите свой второй карьерный путь. Наша система на базе ИИ сопоставит ваши способности с перспективными ролями в атомной и промышленной сферах.',
    icon: 'GitBranch',
  },
  {
    step: 3,
    title: 'Обучение → Стажировка → Работа',
    description: 'Следуйте персональной дорожной карте. Мы проведем вас через обучение, практические стажировки и трудоустроим к работодателям-партнерам.',
    icon: 'Rocket',
  },
];

export const careerTransitions: CareerTransition[] = [
  {
    currentRole: 'Строительный электрик',
    futureRole: 'Техник промышленной автоматизации',
    transitionTime: '8–12 месяцев',
    salaryGrowth: '+34%',
    icon: 'Zap',
  },
  {
    currentRole: 'Сварщик',
    futureRole: 'Специалист по обслуживанию ядерного оборудования',
    transitionTime: '10–14 месяцев',
    salaryGrowth: '+41%',
    icon: 'Flame',
  },
  {
    currentRole: 'Специалист по бетону',
    futureRole: 'Инженер по инспекции инфраструктуры',
    transitionTime: '12–18 месяцев',
    salaryGrowth: '+52%',
    icon: 'HardHat',
  },
];

export const forecastData: ForecastDataPoint[] = [
  { year: '2025', automation: 1200, safety: 800, digital: 600, nuclear: 950 },
  { year: '2026', automation: 1800, safety: 1100, digital: 1000, nuclear: 1200 },
  { year: '2027', automation: 2600, safety: 1500, digital: 1600, nuclear: 1650 },
  { year: '2028', automation: 3400, safety: 2000, digital: 2400, nuclear: 2100 },
  { year: '2029', automation: 4200, safety: 2600, digital: 3200, nuclear: 2800 },
];

export const kpiStats: KPIStat[] = [
  { value: '93%', label: 'Точность подбора карьеры', icon: 'Target' },
  { value: '250+', label: 'Программ обучения', icon: 'BookOpen' },
  { value: '78%', label: 'Успешность трудоустройства', icon: 'TrendingUp' },
  { value: '18', label: 'Регионов покрытия', icon: 'MapPin' },
];

export const userProfile: UserProfile = {
  name: 'Алексей Петров',
  currentPosition: 'Строительный электрик',
  experience: '6 лет',
  region: 'Атомный регион',
  skills: ['Электрические системы', 'Чтение чертежей', 'Промышленная безопасность', 'Монтаж оборудования'],
};

export const skillGaps: SkillGap[] = [
  { name: 'Программирование ПЛК', current: 35, required: 100 },
  { name: 'Промышленная автоматизация', current: 50, required: 100 },
  { name: 'Цифровая диагностика', current: 20, required: 100 },
  { name: 'Технический английский', current: 60, required: 100 },
];

export const careerRoadmap: RoadmapStep[] = [
  { step: 1, title: 'Оценка', status: 'completed', description: 'Оценка навыков завершена' },
  { step: 2, title: 'Программа обучения', status: 'in-progress', description: 'Основы промышленных ПЛК' },
  { step: 3, title: 'Сертификация', status: 'upcoming', description: 'Сертификация IEC 61131-3' },
  { step: 4, title: 'Стажировка', status: 'planned', description: 'Практика на объекте' },
  { step: 5, title: 'Трудоустройство', status: 'target', description: 'Штатная должность' },
];

export const recommendedCourses: Course[] = [
  { title: 'Основы промышленных ПЛК', duration: '6 недель', provider: 'Региональный учебный центр', progress: 45 },
  { title: 'Цифровое промышленное обслуживание', duration: '8 недель', provider: 'Технический университет', progress: 0 },
  { title: 'Стандарты безопасности в автоматизации', duration: '4 недели', provider: 'Институт безопасности', progress: 0 },
];

export const recommendedInternships: Internship[] = [
  { title: 'Стажер-техник по автоматизации', company: 'Центр ядерных операций', match: 92, location: 'Атомный регион' },
  { title: 'Стажер по промышленному обслуживанию', company: 'Региональная электростанция', match: 87, location: 'Атомный регион' },
  { title: 'Помощник по цифровой инфраструктуре', company: 'Промышленные тех. решения', match: 84, location: 'Удаленно / Гибрид' },
];

export const demandChartData: DemandDataPoint[] = [
  { period: 'Текущий', demand: 45, projected: 45 },
  { period: 'II кв. 2025', demand: 52, projected: 58 },
  { period: 'III кв. 2025', demand: 61, projected: 72 },
  { period: 'IV кв. 2025', demand: 68, projected: 85 },
  { period: 'I кв. 2026', demand: null, projected: 98 },
  { period: 'II кв. 2026', demand: null, projected: 115 },
];

export const professions: string[] = [
  'Строительный электрик',
  'Сварщик',
  'Специалист по бетону',
  'Монтажник трубопроводов',
  'Машинист крана',
  'Монтажник стальных конструкций',
  'Стропальщик/Леса',
  'Машинист тяжелой техники',
];

export const experienceOptions: string[] = ['1–2 года', '3–5 лет', '6–10 лет', 'Более 10 лет'];

export const footerPartners: string[] = [
  'Росатом',
  'Альянс технических вузов',
  'Региональные учебные центры',
  'Министерство занятости',
];
