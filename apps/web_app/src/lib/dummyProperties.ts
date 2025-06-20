// Database interface matching new Supabase schema
export interface PropertyData {
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

// Utility functions for Supabase operations
export const supabaseHelpers = {
  // Format date for comparison (ISO string to date comparison)
  formatDateForComparison: (isoString: string | null): string => {
    // Handle null, undefined, or empty strings
    if (!isoString || typeof isoString !== 'string') {
      return '';
    }

    // If it's already in ISO format, return the date part
    if (isoString.includes('T')) {
      return isoString.split('T')[0];
    }

    // Handle dd/mm/yyyy format for backward compatibility
    const parts = isoString.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      
      // Validate that all parts exist and are numeric
      if (!day || !month || !year || isNaN(Number(day)) || isNaN(Number(month)) || isNaN(Number(year))) {
        return '';
      }

      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    return '';
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
