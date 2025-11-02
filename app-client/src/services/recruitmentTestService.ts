import api from '@/api';
import type { RecruitmentTest } from '../types/recruitmentTest';

export interface GenerateRecruitmentTestRequest {
  jobOfferId: number;
  // optional generation parameters
  difficulty?: 'easy' | 'medium' | 'hard';
  numQuestions?: number;
  language?: string;
}

export interface CreateRecruitmentTestRequest {
  jobOfferId: number;
  testJson: any;
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

// Create test manually
export const createRecruitmentTest = async (data: CreateRecruitmentTestRequest): Promise<RecruitmentTest> => {
  const res = await api.post<{ test: RecruitmentTest }>(`/recruitment-tests`, data);
  return res.data.test;
};

// Generate with AI for a job offer - returns generated JSON (not saved to DB yet)
export const generateRecruitmentTest = async (data: GenerateRecruitmentTestRequest): Promise<{ testJson: any; message: string }> => {
  console.log('[Service] Calling generate API with data:', data);
  const startTime = Date.now();
  
  try {
    // Increase timeout for AI generation (60 seconds)
    const res = await api.post<{ testJson: any; message: string }>(
      `/recruitment-tests/generate`, 
      data,
      { timeout: 60000 } // 60 seconds timeout for AI generation
    );
    const duration = Date.now() - startTime;
    console.log('[Service] Generate API successful. Duration:', duration, 'ms');
    console.log('[Service] Response:', res.data);
    return res.data;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('[Service] Generate API failed after', duration, 'ms');
    console.error('[Service] Error:', error);
    throw error;
  }
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

