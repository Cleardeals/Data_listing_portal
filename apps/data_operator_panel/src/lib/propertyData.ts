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

// Sample data for the property table
export const fetchPropertyData = (): PropertyRow[] => {
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
      rentedOut: false
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
      rentedOut: false
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
      rentedOut: true
    },
    {
      id: 4,
      important: 4,
      premium: "",
      specialNote: "",
      date: "23/04/2025\n6d",
      nameContact: "Name 4\n9876543210",
      address: "Address line 4",
      premise: "Premise 4",
      area: "Area 4",
      rent: "13.00 Thd",
      availability: "1BHK Tenement",
      condition: "Furnished",
      sqft: "950 Sqft",
      key: "Call To Owner",
      brokerage: "No Brokerage",
      status: "Available",
      rentedOut: false
    },
    {
      id: 5,
      important: 5,
      premium: "Yes",
      specialNote: "Note",
      date: "23/04/2025\n6d",
      nameContact: "Name 5\n9876543210",
      address: "Address line 5",
      premise: "Premise 5",
      area: "Area 5",
      rent: "14.00 Thd",
      availability: "1BHK Tenement",
      condition: "Furnished",
      sqft: "1000 Sqft",
      key: "Call To Owner",
      brokerage: "No Brokerage",
      status: "Available",
      rentedOut: false
    },
    {
      id: 6,
      important: 6,
      premium: "",
      specialNote: "",
      date: "23/04/2025\n6d",
      nameContact: "Name 6\n9876543210",
      address: "Address line 6",
      premise: "Premise 6",
      area: "Area 6",
      rent: "15.00 Thd",
      availability: "1BHK Tenement",
      condition: "Furnished",
      sqft: "1050 Sqft",
      key: "Call To Owner",
      brokerage: "No Brokerage",
      status: "Available",
      rentedOut: true
    },
    {
      id: 7,
      important: 7,
      premium: "Yes",
      specialNote: "Note",
      date: "23/04/2025\n6d",
      nameContact: "Name 7\n9876543210",
      address: "Address line 7",
      premise: "Premise 7",
      area: "Area 7",
      rent: "16.00 Thd",
      availability: "1BHK Tenement",
      condition: "Furnished",
      sqft: "1100 Sqft",
      key: "Call To Owner",
      brokerage: "No Brokerage",
      status: "Available",
      rentedOut: false
    },
    {
      id: 8,
      important: 8,
      premium: "",
      specialNote: "",
      date: "23/04/2025\n6d",
      nameContact: "Name 8\n9876543210",
      address: "Address line 8",
      premise: "Premise 8",
      area: "Area 8",
      rent: "17.00 Thd",
      availability: "1BHK Tenement",
      condition: "Furnished",
      sqft: "1150 Sqft",
      key: "Call To Owner",
      brokerage: "No Brokerage",
      status: "Available",
      rentedOut: false
    }
  ];
};
