export interface EmployerProfileAddress {
  city?: string;
  state?: string;
  street?: string;
  postalCode?: string;
  latitude?: number;
  longtitude?: number;
}

export interface EmployerProfileUpdateRequest {
  companyName: string;
  companyImageUrl?: string;
  industry?: string[];
  description?: string;
  contractType?: string[];
  contactPhone?: string;
  contactEmail?: string;
  benefits?: string[];
  address?: EmployerProfileAddress;
}
