"use client";

import React, { useState, useEffect } from 'react';

// Define PropertyData type at the top of the file for better accessibility
type PropertyData = {
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
  premium: string;
  specialnote: string;
  rentedout: boolean;
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
    status: 'Active',
    premium: '',
    specialnote: '',
    rentedout: false
  });
  
  // Update form fields if initialData changes (for editing different rows)
  useEffect(() => {
    setData(initialData || {
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
      status: 'Active',
      premium: '',
      specialnote: '',
      rentedout: false
    });
  }, [initialData]);
  
  if (!open) return null;
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData((prev: PropertyData) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"> {/* Removed overflow-y-auto */}
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl my-8 flex flex-col max-h-[90vh]"> {/* Added flex flex-col, removed its own overflow-y-auto */}
        <h2 className="text-xl font-bold mb-4 text-gray-900 sticky top-0 bg-white pt-2 pb-2 z-10"> {/* Added pb-2 and z-10 */}
          {mode === 'edit' ? 'Edit Entry' : 'Add New Entry'}
        </h2>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2 space-y-4"> {/* Added flex-grow, overflow-y-auto, pr-2 for scrollbar, space-y-4 for consistent spacing */}
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block mb-2 text-gray-800 font-medium">Name</label>
              <input
                type="text"
                name="name"
                value={data.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900"
                placeholder="Enter name"
              />
            </div>

            {/* Contact */}
            <div>
              <label className="block mb-2 text-gray-800 font-medium">Contact</label>
              <input
                type="text"
                name="contact"
                value={data.contact}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900"
                placeholder="Enter contact number"
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
            <div>
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

            {/* Rented Out */}
            <div>
              <label className="block mb-2 text-gray-800 font-medium">Rented Out</label>
              <select
                name="rentedout"
                value={data.rentedout ? 'true' : 'false'}
                onChange={(e) => setData(prev => ({ ...prev, rentedout: e.target.value === 'true' }))}
                className="w-full p-2 border rounded text-gray-900"
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>

            {/* Premium */}
            <div className="col-span-2">
              <label className="block mb-2 text-gray-800 font-medium">Premium</label>
              <input
                type="text"
                name="premium"
                value={data.premium}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900"
                placeholder="Enter premium details"
              />
            </div>

            {/* Special Note */}
            <div className="col-span-2">
              <label className="block mb-2 text-gray-800 font-medium">Special Note</label>
              <textarea
                name="specialnote"
                value={data.specialnote}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900"
                rows={3}
                placeholder="Enter special notes or remarks"
              />
            </div>
          </div>
        </form>

        <div className="mt-auto pt-4 border-t border-gray-200 sticky bottom-0 bg-white pb-2 z-10 flex justify-end gap-4"> {/* Changed mt-6 to mt-auto, added classes for sticky footer */}
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
      </div>
    </div>
  );
};

// Export the PropertyData type for use in other components
export type { PropertyData };
