export interface Database {
  public: {
    Tables: {
      propertydata: {
        Row: {
          id: number;
          important: number;
          premium: string;
          specialnote: string;
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
          rentedout: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          important?: number;
          premium?: string;
          specialnote?: string;
          date?: string;
          name: string;
          contact: string;
          address: string;
          premise: string;
          area: string;
          rent: string;
          availability?: string;
          condition?: string;
          sqft?: string;
          key?: string;
          brokerage?: string;
          status?: string;
          rentedout?: boolean;
          created_at?: string;
        };
        Update: {
          id?: number;
          important?: number;
          premium?: string;
          specialnote?: string;
          date?: string;
          name?: string;
          contact?: string;
          address?: string;
          premise?: string;
          area?: string;
          rent?: string;
          availability?: string;
          condition?: string;
          sqft?: string;
          key?: string;
          brokerage?: string;
          status?: string;
          rentedout?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
