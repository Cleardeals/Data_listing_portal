export interface User {
  id: number;
  name: string;
  email: string;
  business: string;
  contact: string;
  subscription: string;
}

// Define subscription types
export enum SubscriptionType {
  FREE = 'Free',
  BASIC = 'Basic',
  PREMIUM = 'Premium',
  ENTERPRISE = 'Enterprise'
}

// Interface for form data (used when adding/editing users)
export interface UserFormData {
  name: string;
  email: string;
  business: string;
  contact: string;
  subscription: string;
}

// Get all available subscription types
export const getSubscriptionTypes = (): string[] => {
  return Object.values(SubscriptionType);
};

// Mock API function to fetch users
export const fetchUsers = async (): Promise<User[]> => {
  // In a real application, this would be an API call
  // For now, we're returning mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: 'Sam',
        email: 'Sam@gmail.com',
        business: 'Business',
        contact: '1234567890',
        subscription: 'Subscription',
      }));
      resolve(users);
    }, 300); // Simulate network delay
  });
};

// Function to delete a user
export const deleteUser = async (id: number): Promise<boolean> => {
  // In a real application, this would be an API call
  console.log(`Deleting user with ID: ${id}`);
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 300);
  });
};

// Function to add a new user
export const addUser = async (user: UserFormData): Promise<User> => {
  // In a real application, this would be an API call
  console.log('Adding new user:', user);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Math.floor(Math.random() * 1000),
        ...user
      });
    }, 300);
  });
};

// Function to update a user
export const updateUser = async (id: number, userData: UserFormData): Promise<User> => {
  // In a real application, this would be an API call
  console.log('Updating user:', userData);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        ...userData
      });
    }, 300);
  });
};

// Update subscription for a user
export const updateSubscription = async (id: number, subscription: string): Promise<User> => {
  console.log(`Updating subscription for user ${id} to ${subscription}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real app, we would fetch the updated user from the server
      // For now, we just return a mock updated user
      resolve({
        id,
        name: 'Sam',
        email: 'Sam@gmail.com',
        business: 'Business',
        contact: '1234567890',
        subscription
      });
    }, 300);
  });
};
