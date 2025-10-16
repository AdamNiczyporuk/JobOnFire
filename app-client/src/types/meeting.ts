export type MeetingType = 'ONLINE' | 'OFFLINE';

export interface BaseMeeting {
  id: number;
  dateTime: string;
  type: MeetingType;
  contributors?: string | null;
  onlineMeetingUrl?: string | null;
  message?: string | null;
}

// Candidate list/detail includes application->jobOffer basic info
export interface CandidateMeeting extends BaseMeeting {
  application: {
    id: number;
    jobOffer: {
      id: number;
      name: string;
      employerProfile?: {
        id: number;
        companyName: string;
      };
    };
  };
}

export interface CandidateMeetingsResponse {
  meetings: CandidateMeeting[];
}

// Employer list/detail includes candidate and offer info
export interface EmployerMeeting extends BaseMeeting {
  application: {
    id: number;
    jobOffer: {
      id: number;
      name: string;
    };
    candidateProfile: {
      id: number;
      name?: string | null;
      lastName?: string | null;
    };
  };
}

export interface EmployerMeetingsResponse {
  meetings: EmployerMeeting[];
}

export interface MeetingCreatePayload {
  applicationId: number;
  dateTime: string; // ISO
  type: MeetingType;
  contributors?: string;
  onlineMeetingUrl?: string;
  message?: string;
}

export interface MeetingUpdatePayload {
  dateTime?: string; // ISO
  type?: MeetingType;
  contributors?: string;
  onlineMeetingUrl?: string;
  message?: string;
}

export interface MeetingMutationResponse<TMeeting = any> {
  message: string;
  meeting?: TMeeting;
}
