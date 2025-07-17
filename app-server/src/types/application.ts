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

export interface ApplicationResponse {
  id: number;
  message?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELED';
  candidateProfileId: number;
  jobOfferId: number;
  cvId: number;
  jobOffer: {
    id: number;
    name: string;
    description?: string;
    contractType?: string;
    salary?: string;
    createDate: Date;
    expireDate: Date;
    employerProfile: {
      id: number;
      companyName: string;
      companyImageUrl?: string;
    };
    lokalization?: {
      city?: string;
      state?: string;
    };
  };
  candidateCV: {
    id: number;
    name?: string;
  };
  answers?: {
    recruitmentQuestionId: number;
    answer?: string;
    question: {
      id: number;
      question?: string;
    };
  }[];
  response?: {
    response?: string;
  };
}

export interface ApplicationStatsResponse {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  canceled: number;
}

export interface ApplicationListResponse {
  applications: ApplicationResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
