// Database interface matching Supabase schema
export interface PropertyData {
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

// Frontend interface for compatibility with existing UI
export interface Property {
  id: number;
  important: boolean;
  date: string;
  nameContact: string;
  name?: string;
  contact?: number;
  address: string;
  premise: string;
  area: string;
  rent: string | number;
  availability: string;
  condition: string;
  sqft: string | null;
  sqftSign?: string;
  key: string;
  brokerage: string;
  status: string;
  rentedOut: boolean;
  description: string;
  description1?: string;
}

// Helper function to convert database format to UI format
export const convertPropertyDataToProperty = (data: PropertyData): Property => {
  return {
    id: data.id,
    important: Boolean(data.important),
    date: data.date || '',
    nameContact: data.name + (data.contact ? `\n${data.contact}` : ''),
    name: data.name,
    contact: data.contact ? parseInt(data.contact) : undefined,
    address: data.address || '',
    premise: data.premise || '',
    area: data.area || '',
    rent: data.rent || '',
    availability: data.availability || '',
    condition: data.condition || '',
    sqft: data.sqft,
    sqftSign: data.sqft || 'NA',
    key: data.key || '',
    brokerage: data.brokerage || '',
    status: data.status || '',
    rentedOut: Boolean(data.rentedout),
    description: data.specialnote || '',
    description1: data.premium || '',
  };
};

// Utility functions for Supabase operations
export const supabaseHelpers = {
  // Format date for comparison (dd/mm/yyyy to yyyy-mm-dd)
  formatDateForComparison: (ddmmyyyy: string): string => {
    const [day, month, year] = ddmmyyyy.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  },

  // Get today's date in yyyy-mm-dd format
  getTodayDate: (): string => {
    return new Date().toISOString().split('T')[0];
  },

  // Get yesterday's date in yyyy-mm-dd format
  getYesterdayDate: (): string => {
    return new Date(Date.now() - 86400000).toISOString().split('T')[0];
  },

  // Convert Property back to PropertyData for updates
  convertPropertyToPropertyData: (property: Property): Partial<PropertyData> => {
    return {
      id: property.id,
      important: property.important ? 1 : 0,
      premium: property.description1 || null,
      specialnote: property.description || null,
      date: property.date || null,
      name: property.name || '',
      contact: property.contact ? property.contact.toString() : null,
      address: property.address || null,
      premise: property.premise || null,
      area: property.area || null,
      rent: property.rent?.toString() || null,
      availability: property.availability || null,
      condition: property.condition || null,
      sqft: property.sqft || null,
      key: property.key || null,
      brokerage: property.brokerage || null,
      status: property.status || null,
      rentedout: property.rentedOut,
    };
  }
};

export const dummyProperties: Property[] = [
  {
    id: 1,
    important: false,
    date: '29/04/2025',
    nameContact: 'Shilpa Kapoor\n9904355714',
    name: "Shilpa kapoor",
    contact: 9904355714,
    address: '25 Sangam Park Society, Near\nHinduja Crossing, Ambawadi',
    premise: 'Sangam Park Society',
    area: '750 Thd',
    rent: 15000,
    availability: '1 Room\nBungalow',
    condition: 'Semi\nFurnished',
    sqft: null,
    sqftSign: 'NA',
    key: 'Call To\nOwner\nBefore 2\nHours',
    brokerage: 'No\nBrokerage',
    status: 'Available',
    rentedOut: false,
    description: 'Description: Online Bathrooms:1 1st Floor For Rent: 15 To 20 Years Old Facing:North Maintenance Including: Both Allowed:2 Person Allowed Description 1: Fan, Double Bed, Wardrobe, Light, Curtain, For Bachelors: First Floor',
    description1: "fan , double bed , wardrobe, light, curtains, for bachelors , first floor",
  },
  {
    id: 2,
    important: true,
    date: '28/04/2025',
    nameContact: 'Get Contact Info',
    address: 'Hira Moti Society, Opp\nSahjanand Hospital, Chandkheda',
    premise: 'Hira Moti Society',
    area: '900 Thd',
    rent: 25000,
    availability: '1 Room\nTenement',
    condition: 'Semi\nFurnished',
    sqft: '500',
    sqftSign: '500 Sqft',
    key: 'Call To\nOwner\nBefore 1\nDay',
    brokerage: 'No\nBrokerage',
    status: 'Available',
    rentedOut: false,
    description: 'Well-maintained property with easy access to public transport.',
  },
  {
    id: 3,
    important: false,
    date: '03/04/2025',
    nameContact: 'Get Contact Info',
    address: 'Nutan Prakash Society, IOC\nRoad, Chandkheda',
    premise: 'Nutan Prakash Society',
    area: '450 Thd',
    rent: 12000,
    availability: '1 Room\nTenement',
    condition: 'Unfurnished',
    sqft: null,
    sqftSign: 'NA',
    key: 'Call To\nOwner\nBefore 2\nHours',
    brokerage: 'No\nBrokerage',
    status: 'Available',
    rentedOut: false,
    description: 'Budget-friendly option in a quiet neighborhood.',
  },
];
