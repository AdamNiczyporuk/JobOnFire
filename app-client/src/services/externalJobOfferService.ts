import api from "@/api";
import {
  ExternalJobOffer,
  ExternalJobOfferCreateRequest,
  ExternalJobOfferUpdateRequest,
  ExternalJobOfferListResponse,
  ExternalJobOfferDetailResponse,
  ExternalJobOfferMutationResponse,
  ApiMessage,
} from "@/types/externalJobOffer";

export const externalJobOfferService = {
  async list(): Promise<ExternalJobOfferListResponse> {
    const response = await api.get("/external-job-offers");
    return response.data;
  },

  async get(id: number): Promise<ExternalJobOfferDetailResponse> {
    const response = await api.get(`/external-job-offers/${id}`);
    return response.data;
  },

  async create(data: ExternalJobOfferCreateRequest): Promise<ExternalJobOfferMutationResponse> {
    const response = await api.post("/external-job-offers", data);
    return response.data;
  },

  async update(id: number, data: ExternalJobOfferUpdateRequest): Promise<ExternalJobOfferMutationResponse> {
    const response = await api.put(`/external-job-offers/${id}`, data);
    return response.data;
  },

  async remove(id: number): Promise<ApiMessage> {
    const response = await api.delete(`/external-job-offers/${id}`);
    return response.data;
  },
};
