import api from '@/api';
import type { RecruitmentQuestion } from '@/types/application';

export interface CreateRecruitmentQuestionRequest {
  jobOfferId: number;
  question: string;
}

export interface UpdateRecruitmentQuestionRequest {
  question: string;
}

export const listRecruitmentQuestions = async (jobOfferId: number): Promise<RecruitmentQuestion[]> => {
  const res = await api.get<{ questions: RecruitmentQuestion[] }>(`/recruitment-questions/job/${jobOfferId}`);
  return res.data.questions || [];
};

export const createRecruitmentQuestion = async (data: CreateRecruitmentQuestionRequest): Promise<RecruitmentQuestion> => {
  const res = await api.post<{ question: RecruitmentQuestion }>(`/recruitment-questions`, data);
  return res.data.question;
};

export const updateRecruitmentQuestion = async (id: number, data: UpdateRecruitmentQuestionRequest): Promise<RecruitmentQuestion> => {
  const res = await api.put<{ question: RecruitmentQuestion }>(`/recruitment-questions/${id}`, data);
  return res.data.question;
};

export const deleteRecruitmentQuestion = async (id: number): Promise<void> => {
  await api.delete(`/recruitment-questions/${id}`);
};
