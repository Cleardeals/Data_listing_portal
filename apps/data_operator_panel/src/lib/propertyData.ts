import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "./types";

export interface PropertyRow {
  id: number;
  important: number;
  premium: string;
  specialNote: string;
  date: string;
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
  rentedOut: boolean;
}

export const fetchPropertyData = async (): Promise<PropertyRow[]> => {
  const supabase = createClientComponentClient<Database>();

  const { data, error } = await supabase
    .from("propertydata")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching property data:", error);
    throw error;
  }

  // Transform the data to match PropertyRow interface
  return data.map((row) => ({
    id: row.id,
    important: row.important,
    premium: row.premium,
    specialNote: row.specialnote,
    date: row.date,
    name: row.name,
    contact: row.contact,
    address: row.address,
    premise: row.premise,
    area: row.area,
    rent: row.rent,
    availability: row.availability,
    condition: row.condition,
    sqft: row.sqft,
    key: row.key,
    brokerage: row.brokerage,
    status: row.status,
    rentedOut: row.rentedout,
  }));
};
