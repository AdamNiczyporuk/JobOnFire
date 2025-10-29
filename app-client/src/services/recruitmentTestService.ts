import api from '@/api';
import type { RecruitmentTest } from '../types/recruitmentTest';

export interface GenerateRecruitmentTestRequest {
  jobOfferId: number;
  // optional generation parameters
  difficulty?: 'easy' | 'medium' | 'hard';
  numQuestions?: number;
  language?: string;
}

export interface UpdateRecruitmentTestRequest {
  testJson: any;
}

// Get test by job offer id (returns null if not found)
export const getRecruitmentTestByJobOffer = async (jobOfferId: number): Promise<RecruitmentTest | null> => {
  try {
    const res = await api.get<{ test: RecruitmentTest }>(`/recruitment-tests/job/${jobOfferId}`);
    return res.data?.test ?? null;
  } catch (err: any) {
    // If backend returns 404 for not found, treat as null
    const status = err?.response?.status;
    if (status === 404) return null;
    throw err;
  }
};

// Generate with AI for a job offer
export const generateRecruitmentTest = async (data: GenerateRecruitmentTestRequest): Promise<RecruitmentTest> => {
  const res = await api.post<{ test: RecruitmentTest }>(`/recruitment-tests/generate`, data);
  return res.data.test;
};

// Update test JSON
export const updateRecruitmentTest = async (id: number, data: UpdateRecruitmentTestRequest): Promise<RecruitmentTest> => {
  const res = await api.put<{ test: RecruitmentTest }>(`/recruitment-tests/${id}`, data);
  return res.data.test;
};

// Delete test
export const deleteRecruitmentTest = async (id: number): Promise<void> => {
  await api.delete(`/recruitment-tests/${id}`);
};
