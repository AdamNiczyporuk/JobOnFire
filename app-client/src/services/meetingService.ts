import api from '@/api';
import {
  CandidateMeetingsResponse,
  EmployerMeetingsResponse,
  MeetingCreatePayload,
  MeetingMutationResponse,
  MeetingUpdatePayload,
  EmployerMeeting,
  CandidateMeeting
} from '@/types/meeting';

// Optional date range filters used by both candidate and employer
type RangeParams = {
  from?: string; // ISO date
  to?: string;   // ISO date
};

// Candidate (read-only)
export const getCandidateMeetings = async (params?: RangeParams): Promise<CandidateMeetingsResponse> => {
  const response = await api.get('/meetings/candidate', { params });
  return response.data;
};

export const getCandidateMeetingDetail = async (id: number): Promise<CandidateMeeting> => {
  const response = await api.get(`/meetings/candidate/${id}`);
  return response.data;
};

// Employer (CRUD)
export const getEmployerMeetings = async (params?: RangeParams): Promise<EmployerMeetingsResponse> => {
  const response = await api.get('/meetings/employer', { params });
  return response.data;
};

export const getEmployerMeetingDetail = async (id: number): Promise<EmployerMeeting> => {
  const response = await api.get(`/meetings/employer/${id}`);
  return response.data;
};

export const createEmployerMeeting = async (payload: MeetingCreatePayload): Promise<MeetingMutationResponse> => {
  const response = await api.post('/meetings/employer', payload);
  return response.data;
};

export const updateEmployerMeeting = async (id: number, payload: MeetingUpdatePayload): Promise<MeetingMutationResponse> => {
  const response = await api.put(`/meetings/employer/${id}`, payload);
  return response.data;
};

export const deleteEmployerMeeting = async (id: number): Promise<MeetingMutationResponse> => {
  const response = await api.delete(`/meetings/employer/${id}`);
  return response.data;
};
