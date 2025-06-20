export interface SupabasePropertyData {
  serial_number: number;
  property_id: string;
  property_type: 'Res_resale' | 'Res_rental' | 'Com_resale' | 'Com_rental' | 'N/A' | null;
  special_note: string | null;
  owner_name: string | null;
  owner_contact: string | null;
  area: string | null;
  address: string | null;
  sub_property_type: string | null;
  size: number | null;
  furnishing_status: 'Furnished' | 'Unfurnished' | 'Semi-Furnished' | 'N/A' | null;
  availability: string | null;
  floor: string | null;
  tenant_preference: 'All' | 'Bachelors (Men Only)' | 'Bachelors (Men/Women)' | 'Bachelors (Women Only)' | 'Both' | 'Family Only' | 'N/A' | null;
  additional_details: string | null;
  age: string | null;
  rent_or_sell_price: string | null;
  deposit: string | null;
  date_stamp: string | null;
  rent_sold_out: boolean | null;
}

// Form data interface for Add/Edit modals
export interface PropertyFormData {
  owner_name: string;
  owner_contact: string;
  area: string;
  address: string;
  property_type: 'Res_resale' | 'Res_rental' | 'Com_resale' | 'Com_rental' | 'N/A';
  sub_property_type: string;
  size: number | string;
  furnishing_status: 'Furnished' | 'Unfurnished' | 'Semi-Furnished' | 'N/A';
  availability: string;
  floor: string;
  tenant_preference: 'All' | 'Bachelors (Men Only)' | 'Bachelors (Men/Women)' | 'Bachelors (Women Only)' | 'Both' | 'Family Only' | 'N/A';
  additional_details: string;
  age: string;
  rent_or_sell_price: string;
  deposit: string;
  special_note?: string;
}
