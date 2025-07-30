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
