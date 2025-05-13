"use client";

import React, { useState } from 'react';

// Define the AddEditPropertyModal component
const AddEditPropertyModal = ({ 
  open, 
  onClose, 
  mode, 
  initialData, 
  onSubmit 
}: { 
  open: boolean; 
  onClose: () => void; 
  mode: 'edit' | 'add'; 
  initialData: any; 
  onSubmit: (data: any) => void;
}) => {
  const [data, setData] = useState(initialData || {});
  
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4 text-gray-900">
          {mode === 'edit' ? 'Edit' : 'Add'} Property
        </h2>
        {/* Form implementation would go here */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100 text-gray-900"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSubmit(data)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const AddEntryModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nameContact: '',
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

  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission here
    console.log(formData);
    setIsModalOpen(false);
  };

  const handleEdit = (property: typeof formData) => {
    setEditData(property);
    setShowEditModal(true);
  };

  const handleSaveEdit = (data: typeof formData) => {
    // Handle save edit logic here
    console.log('Saving edited data:', data);
    setShowEditModal(false);
  };

  return (
    <div>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Add Entry
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Add New Entry</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                {/* Name & Contact */}
                <div className="col-span-2">
                  <label className="block mb-2 text-gray-800 font-medium">Name & Contact</label>
                  <input
                    type="text"
                    name="nameContact"
                    value={formData.nameContact}
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
                    value={formData.address}
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
                    value={formData.premise}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded text-gray-900"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-gray-800 font-medium">Area</label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
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
                    value={formData.rent}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded text-gray-900"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-gray-800 font-medium">Availability</label>
                  <select
                    name="availability"
                    value={formData.availability}
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
                    value={formData.condition}
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
                    value={formData.sqft}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded text-gray-900"
                  />
                </div>

                {/* Key & Brokerage */}
                <div>
                  <label className="block mb-2 text-gray-800 font-medium">Key</label>
                  <select
                    name="key"
                    value={formData.key}
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
                    value={formData.brokerage}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded text-gray-900"
                  />
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <label className="block mb-2 text-gray-800 font-medium">Status</label>
                  <select
                    name="status"
                    value={formData.status}
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
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100 text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AddEditPropertyModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        mode="edit"
        initialData={editData}
        onSubmit={handleSaveEdit}
      />
    </div>
  );
};

export default AddEntryModal;