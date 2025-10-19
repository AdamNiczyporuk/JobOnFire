export interface ApplicationCreateRequest {
  message?: string;
  jobOfferId: number;
  cvId: number;
  answers?: {
    recruitmentQuestionId: number;
    answer?: string;
  }[];
}

export interface ApplicationUpdateRequest {
  message?: string;
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELED';
  cvId?: number;
}

export interface RecruitmentQuestion {
  id: number;
  question?: string;
}

export interface QuestionAnswer {
  recruitmentQuestionId: number;
  answer?: string;
}

export interface ApplicationFormData {
  message: string;
  cvId: number | null;
  answers: QuestionAnswer[];
}

// Typy dla endpointu pracodawcy
export interface EmployerApplication {
  id: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELED';
  jobOffer: {
    id: number;
    name: string;
  };
  candidate: {
    id: number;
    name: string;
    lastName: string;
    fullName: string;
  };
  recruitmentQuestions: {
    total: number;
    answered: number;
    allAnswered: boolean;
  };
  meeting: {
    id?: number;
    dateTime?: string;
    type?: 'ONLINE' | 'OFFLINE';
    isScheduled: boolean;
  };
  createdAt: string;
}

export interface EmployerApplicationsResponse {
  applications: EmployerApplication[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  summary: {
    totalApplications: number;
  };
}

export interface EmployerApplicationsParams {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELED';
  jobOfferId?: number;
}

// Typy dla widoku szczegółowego aplikacji pracodawcy
export interface EmployerApplicationDetail {
  id: number;
  message?: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELED';
  createDate: string;
  candidateProfileId: number;
  jobOfferId: number;
  cvId: number;
  jobOffer: {
    id: number;
    name: string;
    description?: string;
    requirements?: any;
    responsibilities?: any;
    whatWeOffer?: any;
    questions: {
      id: number;
      question?: string;
    }[];
  };
  candidateProfile: {
    id: number;
    name?: string;
    lastName?: string;
    description?: string;
    experience?: any;
    skills?: any;
    place?: string;
    education?: any;
    phoneNumber?: number;
  };
  candidateCV: {
    id: number;
    name?: string;
    cvUrl?: string;
  };
  answers: {
    recruitmentQuestionId: number;
    answer?: string;
    question: {
      id: number;
      question?: string;
    };
  }[];
  response?: {
    applicationForJobOfferId: number;
    response?: string | null;
  } | null;
  meetings: {
    id: number;
    dateTime: string;
    type: 'ONLINE' | 'OFFLINE';
    contributors?: string | null;
    onlineMeetingUrl?: string | null;
    message?: string | null;
  }[];
}

export interface ApplicationResponseRequest {
  response: string;
}

export interface MeetingCreateRequest {
  dateTime: string;
  type: 'ONLINE' | 'OFFLINE';
  contributors?: string;
  onlineMeetingUrl?: string;
  message?: string;
}

export interface ApplicationStatusUpdateRequest {
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELED';
}
