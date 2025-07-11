export interface JobOffer {
  id: number;
  name: string;
  description?: string;
  jobLevel?: string[];
  contractType?: string;
  salary?: string;
  createDate: string;
  expireDate: string;
  workingMode?: string[];
  workload?: string;
  responsibilities?: string[];
  requirements?: string[];
  whatWeOffer?: string[];
  applicationUrl?: string;
  tags?: string[];
  isActive: boolean;
  lokalizationId?: number;
  employerProfileId: number;
  lokalization?: JobOfferLokalization;
  applications?: JobOfferApplication[];
  questions?: RecruitmentQuestion[];
  _count?: {
    applications: number;
  };
}

export interface JobOfferLokalization {
  id: number;
  city?: string;
  state?: string;
  street?: string;
  postalCode?: string;
  latitude?: number;
  longtitude?: number;
}

export interface JobOfferApplication {
  id: number;
  message?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELED';
  candidateProfile: {
    id: number;
    name?: string;
    lastName?: string;
    phoneNumber?: number;
  };
  candidateCV: {
    id: number;
    name?: string;
    cvUrl?: string;
  };
}

export interface RecruitmentQuestion {
  id: number;
  question?: string;
  jobOfferId: number;
}

export interface JobOfferCreateRequest {
  name: string;
  description?: string;
  jobLevel?: string[];
  contractType?: string;
  salary?: string;
  expireDate: string;
  workingMode?: string[];
  workload?: string;
  responsibilities?: string[];
  requirements?: string[];
  whatWeOffer?: string[];
  applicationUrl?: string;
  tags?: string[];
  lokalizationId?: number;
}

export interface JobOfferUpdateRequest {
  name?: string;
  description?: string;
  jobLevel?: string[];
  contractType?: string;
  salary?: string;
  expireDate?: string;
  workingMode?: string[];
  workload?: string;
  responsibilities?: string[];
  requirements?: string[];
  whatWeOffer?: string[];
  applicationUrl?: string;
  tags?: string[];
  lokalizationId?: number;
  isActive?: boolean;
}

export interface JobOfferListResponse {
  jobOffers: JobOffer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface JobOfferResponse {
  message: string;
  jobOffer: JobOffer;
}

export interface JobOfferListParams {
  page?: number;
  limit?: number;
}
