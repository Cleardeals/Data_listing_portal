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
  }
};
