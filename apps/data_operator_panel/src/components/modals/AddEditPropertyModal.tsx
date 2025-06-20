"use client";

import React, { useState, useEffect } from 'react';

// Define PropertyData type matching the new schema
type PropertyData = {
  owner_name: string;
  owner_contact: string;
  area: string;
  address: string;
  property_type: 'Res_resale' | 'Res_rental' | 'Com_resale' | 'Com_rental' | 'N/A';
  sub_property_type: string;
  size: number | string;
  furnishing_status: 'Furnished' | 'Unfurnished' | 'Semi-Furnished' | 'N/A';
  availability: string;
  floor: string;
  tenant_preference: 'All' | 'Bachelors (Men Only)' | 'Bachelors (Men/Women)' | 'Bachelors (Women Only)' | 'Both' | 'Family Only' | 'N/A';
  additional_details: string;
  age: string;
  rent_or_sell_price: string;
  deposit: string;
  special_note: string;
};

// Area options based on the new schema
const areaOptions = [
  'Aundh', 'Balewadi', 'Baner', 'Bavdhan', 'Bhosari', 'Bibwewadi', 'Budhwar Peth',
  'Chakan', 'Dhanori', 'Dhanraj Road', 'Deccan Gymkhana', 'Dhayari', 'Hadapsar',
  'Hinjewadi', 'Kalyani Nagar', 'Karve Nagar', 'Katraj', 'Kharadi', 'Kondhwa',
  'Koregaon Park', 'Kothrud', 'Lohegaon', 'Lullanagar', 'Magarpatta', 'Marunji',
  'Model Colony', 'Mohammedwadi', 'Moshi', 'Mundhwa', 'NIBM Road', 'Narayan Peth',
  'Pashan', 'Pimple Saudagar', 'Pimple Gurav', 'Pimple Nilakh', 'Pimpri Chinchwad',
  'Ravet', 'Sadashiv Peth', 'Sahakar Nagar', 'Shaniwar Peth', 'Shivajinagar',
  'Sinhagad Road', 'Swargate', 'Talegaon', 'Tathawade', 'Undri', 'Uruli Kanchan',
  'Viman Nagar', 'Vishrantwadi', 'Wagholi', 'Wakad', 'Wanwadi', 'Warje',
  'Wadgaon Sheri', 'Yerawada', 'Chinchwad', 'Sus', 'Kate Wasti', 'Nigdi',
  'Susgav', 'Suisgaon', 'Rahatani', 'Akurdi', 'Punawale', 'N/A'
];

// Sub property type options
const subPropertyTypeOptions = [
  '1 BHK', '1.5 BHK', '1 Rk', '1RK', '1 RK', '1BHK',
  '2 BHK', '2.5 BHK', '2.5BHK', '2 BHk', '2BHK',
  '3 BHK', '3.5 BHK', '3BHK',
  '4 BHK', '4.5 BHK',
  '5 BHK', '6 BHK', '8 BHK', '10 BHK',
  'N/A'
];

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
    owner_name: '',
    owner_contact: '',
    area: 'N/A',
    address: '',
    property_type: 'N/A',
    sub_property_type: 'N/A',
    size: '',
    furnishing_status: 'N/A',
    availability: '',
    floor: '',
    tenant_preference: 'N/A',
    additional_details: '',
    age: '',
    rent_or_sell_price: '',
    deposit: '',
    special_note: ''
  });
  
  // Update form fields if initialData changes (for editing different rows)
  useEffect(() => {
    setData(initialData || {
      owner_name: '',
      owner_contact: '',
      area: 'N/A',
      address: '',
      property_type: 'N/A',
      sub_property_type: 'N/A',
      size: '',
      furnishing_status: 'N/A',
      availability: '',
      floor: '',
      tenant_preference: 'N/A',
      additional_details: '',
      age: '',
      rent_or_sell_price: '',
      deposit: '',
      special_note: ''
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-4xl my-8 flex flex-col max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4 text-gray-900 sticky top-0 bg-white pt-2 pb-2 z-10">
          {mode === 'edit' ? 'Edit Property' : 'Add New Property'}
        </h2>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            
            {/* Owner Name */}
            <div>
              <label className="block mb-2 text-gray-800 font-medium">Owner Name</label>
              <input
                type="text"
                name="owner_name"
                value={data.owner_name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900"
                placeholder="Enter owner name"
              />
            </div>

            {/* Owner Contact */}
            <div>
              <label className="block mb-2 text-gray-800 font-medium">Owner Contact</label>
              <input
                type="text"
                name="owner_contact"
                value={data.owner_contact}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900"
                placeholder="10-digit contact number"
                maxLength={10}
              />
            </div>

            {/* Property Type */}
            <div>
              <label className="block mb-2 text-gray-800 font-medium">Property Type</label>
              <select
                name="property_type"
                value={data.property_type}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900"
              >
                <option value="N/A">N/A</option>
                <option value="Res_resale">Residential Resale</option>
                <option value="Res_rental">Residential Rental</option>
                <option value="Com_resale">Commercial Resale</option>
                <option value="Com_rental">Commercial Rental</option>
              </select>
            </div>

            {/* Area */}
            <div>
              <label className="block mb-2 text-gray-800 font-medium">Area</label>
              <select
                name="area"
                value={data.area}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900"
              >
                {areaOptions.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
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
                placeholder="Full address"
              />
            </div>

            {/* Sub Property Type */}
            <div>
              <label className="block mb-2 text-gray-800 font-medium">Sub Property Type</label>
              <select
                name="sub_property_type"
                value={data.sub_property_type}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900"
              >
                {subPropertyTypeOptions.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Size */}
            <div>
              <label className="block mb-2 text-gray-800 font-medium">Size (sq ft)</label>
              <input
                type="number"
                name="size"
                value={data.size}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900"
                placeholder="Size in square feet"
              />
            </div>

            {/* Furnishing Status */}
            <div>
              <label className="block mb-2 text-gray-800 font-medium">Furnishing Status</label>
              <select
                name="furnishing_status"
                value={data.furnishing_status}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900"
              >
                <option value="N/A">N/A</option>
                <option value="Furnished">Furnished</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Unfurnished">Unfurnished</option>
              </select>
            </div>

            {/* Floor */}
            <div>
              <label className="block mb-2 text-gray-800 font-medium">Floor</label>
              <input
                type="text"
                name="floor"
                value={data.floor}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900"
                placeholder="e.g., Ground, 1st, 2nd"
              />
            </div>

            {/* Tenant Preference */}
            <div>
              <label className="block mb-2 text-gray-800 font-medium">Tenant Preference</label>
              <select
                name="tenant_preference"
                value={data.tenant_preference}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900"
              >
                <option value="N/A">N/A</option>
                <option value="All">All</option>
                <option value="Family Only">Family Only</option>
                <option value="Bachelors (Men Only)">Bachelors (Men Only)</option>
                <option value="Bachelors (Women Only)">Bachelors (Women Only)</option>
                <option value="Bachelors (Men/Women)">Bachelors (Men/Women)</option>
                <option value="Both">Both</option>
              </select>
            </div>

            {/* Age */}
            <div>
              <label className="block mb-2 text-gray-800 font-medium">Age</label>
              <input
                type="text"
                name="age"
                value={data.age}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900"
                placeholder="Property age"
              />
            </div>

            {/* Rent or Sell Price */}
            <div>
              <label className="block mb-2 text-gray-800 font-medium">Rent/Sell Price</label>
              <input
                type="text"
                name="rent_or_sell_price"
                value={data.rent_or_sell_price}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900"
                placeholder="Price amount"
              />
            </div>

            {/* Deposit */}
            <div>
              <label className="block mb-2 text-gray-800 font-medium">Deposit</label>
              <input
                type="text"
                name="deposit"
                value={data.deposit}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900"
                placeholder="Security deposit"
              />
            </div>

            {/* Availability */}
            <div>
              <label className="block mb-2 text-gray-800 font-medium">Availability</label>
              <input
                type="text"
                name="availability"
                value={data.availability}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900"
                placeholder="When available"
              />
            </div>

            {/* Additional Details */}
            <div className="col-span-2">
              <label className="block mb-2 text-gray-800 font-medium">Additional Details</label>
              <textarea
                name="additional_details"
                value={data.additional_details}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900"
                rows={3}
                placeholder="Additional property details"
              />
            </div>

            {/* Special Note */}
            <div className="col-span-2">
              <label className="block mb-2 text-gray-800 font-medium">Special Note</label>
              <textarea
                name="special_note"
                value={data.special_note}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900"
                rows={3}
                placeholder="Special notes or remarks"
              />
            </div>
          </div>
          
          <div className="mt-auto pt-4 border-t border-gray-200 sticky bottom-0 bg-white pb-2 z-10 flex justify-end gap-4">
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
              {mode === 'edit' ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Export the PropertyData type for use in other components
export type { PropertyData };
