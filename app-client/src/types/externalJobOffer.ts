export interface ExternalJobOffer {
  id: number;
  url: string;
  site?: string | null;
  name: string;
  company?: string | null;
  candidateProfileId: number;
}

export interface ExternalJobOfferCreateRequest {
  url: string;
  name: string;
  site?: string;
  company?: string;
}

export interface ExternalJobOfferUpdateRequest {
  url?: string;
  name?: string;
  site?: string | null;
  company?: string | null;
}

export interface ExternalJobOfferListResponse {
  externalJobOffers: ExternalJobOffer[];
}

export interface ExternalJobOfferDetailResponse {
  externalJobOffer: ExternalJobOffer;
}

export interface ExternalJobOfferMutationResponse {
  message: string;
  externalJobOffer: ExternalJobOffer;
}

export interface ApiMessage {
  message: string;
}
