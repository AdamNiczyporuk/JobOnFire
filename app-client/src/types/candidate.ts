// Typy dla doświadczenia zawodowego
export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  description?: string | null;
  location?: string | null;
}

// Typy dla umiejętności
export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export interface Skill {
  name: string;
  level: SkillLevel;
  category?: string | null;
}

// Typy dla wykształcenia
export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy?: string | null;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  description?: string | null;
  location?: string | null;
}

// Typ dla profilu kandydata
export interface CandidateProfile {
  id: number;
  name?: string | null;
  lastName?: string | null;
  description?: string | null;
  birthday?: string | null;
  experience: Experience[];
  phoneNumber?: number | null;
  skills: Skill[];
  place?: string | null;
  education: Education[];
  userId: number;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
  profileLinks: ProfileLink[];
  candidateCVs: CandidateCV[];
  applications: Application[];
}

// Typ dla linków do profilu
export interface ProfileLink {
  id: number;
  name: string;
  url: string;
  candidateProfileId: number;
}

// Typ dla CV kandydata
export interface CandidateCV {
  id: number;
  cvJson?: string | null;
  candidateProfileId: number;
  cvUrl?: string | null;
  name?: string | null;
}

// Typ dla aplikacji
export interface Application {
  id: number;
  message?: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELED';
  candidateProfileId: number;
  jobOfferId: number;
  cvId: number;
  jobOffer: {
    id: number;
    name: string;
    employerProfile: {
      companyName: string;
      companyImageUrl?: string | null;
    };
  };
}

// Typ dla statystyk kandydata
export interface CandidateStats {
  totalApplications: number;
  totalCVs: number;
  totalProfileLinks: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  experienceCount: number;
  skillsCount: number;
  educationCount: number;
}

// Typy dla formularzy
export interface CandidateProfileFormData {
  name?: string;
  lastName?: string;
  description?: string;
  birthday?: string;
  experience: Experience[];
  phoneNumber?: number;
  skills: Skill[];
  place?: string;
  education: Education[];
}

// Stałe dla poziomów umiejętności
export const SKILL_LEVELS: { value: SkillLevel; label: string }[] = [
  { value: 'BEGINNER', label: 'Początkujący' },
  { value: 'INTERMEDIATE', label: 'Średniozaawansowany' },
  { value: 'ADVANCED', label: 'Zaawansowany' },
  { value: 'EXPERT', label: 'Ekspert' }
];

// Stałe dla kategorii umiejętności
export const SKILL_CATEGORIES = [
  'Frontend',
  'Backend', 
  'Fullstack',
  'Mobile',
  'DevOps',
  'Data Science',
  'Design',
  'Marketing',
  'Zarządzanie',
  'Języki obce',
  'Umiejętności miękkie',
  'Inne'
] as const;

export type SkillCategory = typeof SKILL_CATEGORIES[number];
