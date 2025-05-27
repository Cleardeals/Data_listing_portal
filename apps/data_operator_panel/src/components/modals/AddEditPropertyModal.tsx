"use client";

import React, { useState, useEffect } from 'react';

// Define PropertyData type at the top of the file for better accessibility
type PropertyData = {
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
};

// Define the AddEditPropertyModal component
export const AddEditPropertyModal = ({ 
  open, 
  onClose, 
  mode, 
  initialData, 
  onSubmit 
}: { 
  open: boolean; 
  onClose: () => void; 
  mode: 'edit' | 'add'; 
  initialData: PropertyData | null; 
  onSubmit: (data: PropertyData) => void;
}) => {
  const [data, setData] = useState<PropertyData>(initialData || {
    important: 0,
    premium: '',
    specialNote: '',
    date: '',
    name: '',
    contact: '',
    address: '',
    premise: '',
    area: '',
    rent: '',
    availability: 'Available',
    condition: 'New',
    sqft: '',
    key: 'Yes',
    brokerage: '',
    status: 'Active'
  });
  
  // Update form fields if initialData changes (for editing different rows)
  useEffect(() => {
    setData(initialData || {
      important: 0,
      premium: '',
      specialNote: '',
      date: '',
      name: '',
      contact: '',
      address: '',
      premise: '',
      area: '',
      rent: '',
      availability: 'Available',
      condition: 'New',
      sqft: '',
      key: 'Yes',
      brokerage: '',
      status: 'Active'
    });
  }, [initialData]);
  
  if (!open) return null;
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData((prev: PropertyData) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4 text-gray-900">
          {mode === 'edit' ? 'Edit Entry' : 'Add New Entry'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            {/* Name & Contact */}
            <div>
              <label className="block mb-2 text-gray-800 font-medium">Name</label>
              <input
                type="text"
                name="name"
                value={data.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900"
              />
            </div>
            <div>
              <label className="block mb-2 text-gray-800 font-medium">Contact</label>
              <input
                type="text"
                name="contact"
                value={data.contact}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900"
              />
            </div>

            {/* Address */}
            <div className="col-span-2">
              <label className="block mb-2 text-gray-800 font-medium">Address</label>
              <input
                type="text"
                name="address"
                value={data.address}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900"
              />
            </div>

            {/* Important, Premium, Special Note, Date */}
            <div>
              <label className="block mb-2 text-gray-800 font-medium">Important</label>
              <input
                type="number"
                name="important"
                value={data.important}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900"
              />
            </div>
            <div>
              <label className="block mb-2 text-gray-800 font-medium">Premium</label>
              <input
                type="text"
                name="premium"
                value={data.premium}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900"
              />
            </div>
            <div>
              <label className="block mb-2 text-gray-800 font-medium">Special Note</label>
              <input
                type="text"
                name="specialNote"
                value={data.specialNote}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900"
              />
            </div>
            <div>
              <label className="block mb-2 text-gray-800 font-medium">Date</label>
              <input
                type="text"
                name="date"
                value={data.date}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900"
              />
            </div>

            {/* Premise & Area */}
            <div>
              <label className="block mb-2 text-gray-800 font-medium">Premise</label>
              <input
                type="text"
                name="premise"
                value={data.premise}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900"
              />
            </div>
            <div>
              <label className="block mb-2 text-gray-800 font-medium">Area</label>
              <input
                type="text"
                name="area"
                value={data.area}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900"
              />
            </div>

            {/* Rent & Availability */}
            <div>
              <label className="block mb-2 text-gray-800 font-medium">Rent</label>
              <input
                type="number"
                name="rent"
                value={data.rent}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900"
              />
            </div>
            <div>
              <label className="block mb-2 text-gray-800 font-medium">Availability</label>
              <select
                name="availability"
                value={data.availability}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900"
              >
                <option>Available</option>
                <option>Occupied</option>
                <option>Under Maintenance</option>
              </select>
            </div>

            {/* Condition & SqFt/Sqyd */}
            <div>
              <label className="block mb-2 text-gray-800 font-medium">Condition</label>
              <select
                name="condition"
                value={data.condition}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900"
              >
                <option>New</option>
                <option>Renovated</option>
                <option>Needs Repair</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-gray-800 font-medium">SqFt/Sqyd</label>
              <input
                type="number"
                name="sqft"
                value={data.sqft}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900"
              />
            </div>

            {/* Key & Brokerage */}
            <div>
              <label className="block mb-2 text-gray-800 font-medium">Key</label>
              <select
                name="key"
                value={data.key}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900"
              >
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-gray-800 font-medium">Brokerage</label>
              <input
                type="text"
                name="brokerage"
                value={data.brokerage}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900"
              />
            </div>

            {/* Status */}
            <div className="col-span-2">
              <label className="block mb-2 text-gray-800 font-medium">Status</label>
              <select
                name="status"
                value={data.status}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900"
              >
                <option>Active</option>
                <option>Inactive</option>
                <option>Pending</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100 text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {mode === 'edit' ? 'Edit' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Export the PropertyData type for use in other components
export type { PropertyData };
