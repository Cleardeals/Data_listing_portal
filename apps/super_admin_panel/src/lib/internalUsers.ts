// Define user data types for the application

export type TableUser = {
  no: number;
  name: string;
  email: string;
  role: string;
  contact: string;
};

export type UserFormData = {
  name: string;
  email: string;
  contact: string;
  role: string;
  password?: string;
  // permission field removed as it's not being used
};

// Available roles for dropdown selection
export const availableRoles = [
  "Admin",
  "Editor",
  "Viewer",
  "Analyst",
  "Manager"
];

// Mock data function to get internal users
export const getInternalUsers = (): TableUser[] => {
  return Array.from({ length: 10 }, (_, i) => ({
    no: i + 1,
    name: 'Sam',
    email: 'Sam@gmail.com',
    role: availableRoles[i % availableRoles.length],
    contact: '1234567890',
  }));
};
