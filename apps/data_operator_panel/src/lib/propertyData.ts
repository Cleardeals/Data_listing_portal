export interface PropertyRow {
  id: number;
  important: number;
  premium: string;
  specialNote: string;
  date: string;
  nameContact: string;
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

// Temporary data for development
export const fetchPropertyData = async (): Promise<PropertyRow[]> => {
  return [
    {
      id: 1,
      important: 1,
      premium: "Yes",
      specialNote: "Note",
      date: "23/04/2025\n6d",
      nameContact: "Name 1\n9876543210",
      address: "Address line 1",
      premise: "Premise 1",
      area: "Area 1",
      rent: "10.00 Thd",
      availability: "1BHK Tenement",
      condition: "Furnished",
      sqft: "800 Sqft",
      key: "Call To Owner",
      brokerage: "No Brokerage",
      status: "Available",
      rentedOut: false,
    },
    {
      id: 2,
      important: 2,
      premium: "",
      specialNote: "",
      date: "23/04/2025\n6d",
      nameContact: "Name 2\n9876543210",
      address: "Address line 2",
      premise: "Premise 2",
      area: "Area 2",
      rent: "11.00 Thd",
      availability: "1BHK Tenement",
      condition: "Furnished",
      sqft: "850 Sqft",
      key: "Call To Owner",
      brokerage: "No Brokerage",
      status: "Available",
      rentedOut: false,
    },
    {
      id: 3,
      important: 3,
      premium: "Yes",
      specialNote: "Note",
      date: "23/04/2025\n6d",
      nameContact: "Name 3\n9876543210",
      address: "Address line 3",
      premise: "Premise 3",
      area: "Area 3",
      rent: "12.00 Thd",
      availability: "1BHK Tenement",
      condition: "Furnished",
      sqft: "900 Sqft",
      key: "Call To Owner",
      brokerage: "No Brokerage",
      status: "Available",
      rentedOut: false,
    },
  ];
};
