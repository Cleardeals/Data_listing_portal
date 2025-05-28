export interface SupabasePropertyData {
  id: number;
  important: number | null;
  premium: string | null;
  specialnote: string | null;
  date: string | null;
  name: string;
  contact: string | null;
  address: string | null;
  premise: string | null;
  area: string | null;
  rent: string | null;
  availability: string | null;
  condition: string | null;
  sqft: string | null;
  key: string | null;
  brokerage: string | null;
  status: string | null;
  rentedout: boolean | null;
  created_at: string;
  updated_at: string;
}

// Form data interface for Add/Edit modals
export interface PropertyFormData {
  name: string;
  contact: string;
  address: string;
  premise: string;
  area: string;
  rent: string;
  availability: string;
  condition: string;
  sqft: string;
  key: string;
  brokerage: string;
  status: string;
  premium?: string;
  specialnote?: string;
  important?: number;
}
