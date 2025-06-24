export interface SupabasePropertyData {
  serial_number: number;
  property_id: string;
  property_type: string | null;
  special_note: string | null;
  owner_name: string | null;
  owner_contact: string | null;
  area: string | null;
  address: string | null;
  sub_property_type: string | null;
  size: string | null;
  furnishing_status: string | null;
  availability: string | null;
  floor: string | null;
  tenant_preference: string | null;
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
  property_type: string;
  sub_property_type: string;
  size: string;
  furnishing_status: string;
  availability: string;
  floor: string;
  tenant_preference: string;
  additional_details: string;
  age: string;
  rent_or_sell_price: string;
  deposit: string;
  special_note?: string;
}
