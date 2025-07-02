"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDynamicOptions } from '../../lib/dynamicOptions';

// Define PropertyData type matching the exact database schema
type PropertyData = {
  owner_name: string;
  owner_contact: string;
  area: string;
  address: string;
  property_type: string;
  sub_property_type: string;
  size: string;
  furnishing_status: string;
  availability: string;
  floor: string;
  tenant_preference: string;
  additional_details: string;
  age: string;
  rent_or_sell_price: string;
  deposit: string;
  special_note: string;
  visibility: boolean;
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
  // Use dynamic options hook for live data from Supabase
  const { options: dynamicOptions, loading: optionsLoading, error: optionsError } = useDynamicOptions(true);
  
  const [data, setData] = useState<PropertyData>(initialData || {
    owner_name: '',
    owner_contact: '',
    area: 'N/A',
    address: '',
    property_type: 'N/A',
    sub_property_type: 'N/A',
    size: '',
    furnishing_status: 'N/A',
    availability: 'N/A',
    floor: '',
    tenant_preference: 'N/A',
    additional_details: '',
    age: '',
    rent_or_sell_price: '',
    deposit: '',
    special_note: '',
    visibility: true
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
      availability: 'N/A',
      floor: '',
      tenant_preference: 'N/A',
      additional_details: '',
      age: '',
      rent_or_sell_price: '',
      deposit: '',
      special_note: '',
      visibility: true
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

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto" 
      style={{ 
        zIndex: 99999, 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh'
      }}
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl border border-white/20 my-4 mx-4 relative" style={{ zIndex: 100000 }}>
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-t-2xl px-6 py-4 border-b border-slate-600/50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-blue-400 text-lg">
                  {mode === 'edit' ? '✏️' : '➕'}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {mode === 'edit' ? 'Edit Property' : 'Add New Property'}
                </h2>
                <p className="text-slate-300 text-sm">
                  {mode === 'edit' ? 'Update property information' : 'Fill in the property details below'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white transition-all duration-200 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Enhanced Form Container */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6">
              <div className="space-y-8">
                
                {/* Owner Information Section */}
                <div className="bg-slate-50/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-orange-600 text-sm">👤</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Owner Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Owner Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="owner_name"
                        value={data.owner_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Enter owner name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Owner Contact <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="owner_contact"
                        value={data.owner_contact}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="10-digit contact number"
                        pattern="[0-9]{10}"
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Property Details Section */}
                <div className="bg-slate-50/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 text-sm">🏠</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Property Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Property Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="property_type"
                        value={data.property_type}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        disabled={optionsLoading}
                        required
                      >
                        {dynamicOptions.propertyTypes.map((type: string) => (
                          <option key={type} value={type}>
                            {type === 'Res_resale' ? '🏠 Residential Resale' :
                             type === 'Res_rental' ? '🏠 Residential Rental' :
                             type === 'Com_resale' ? '🏢 Commercial Resale' :
                             type === 'Com_rental' ? '🏢 Commercial Rental' : type}
                          </option>
                        ))}
                      </select>
                      {optionsError && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><span>⚠️</span> Error loading options</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Sub Property Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="sub_property_type"
                        value={data.sub_property_type}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        disabled={optionsLoading}
                        required
                      >
                        {dynamicOptions.subPropertyTypes.map((type: string) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      {optionsError && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><span>⚠️</span> Error loading options</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Size <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="size"
                        value={data.size}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="e.g., 1000 sq ft, 2 BHK, 50x30"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Floor
                      </label>
                      <input
                        type="text"
                        name="floor"
                        value={data.floor}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="e.g., Ground, 1st, 2nd"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Furnishing Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="furnishing_status"
                        value={data.furnishing_status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        disabled={optionsLoading}
                        required
                      >
                        {dynamicOptions.furnishingStatuses.map((status: string) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      {optionsError && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><span>⚠️</span> Error loading options</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Tenant Preference
                      </label>
                      <select
                        name="tenant_preference"
                        value={data.tenant_preference}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        disabled={optionsLoading}
                      >
                        {dynamicOptions.tenantPreferences.map((preference: string) => (
                          <option key={preference} value={preference}>{preference}</option>
                        ))}
                      </select>
                      {optionsError && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><span>⚠️</span> Error loading options</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Age
                      </label>
                      <input
                        type="text"
                        name="age"
                        value={data.age}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Property age (e.g., 5 years, New)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Availability <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="availability"
                        value={data.availability}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        disabled={optionsLoading}
                        required
                      >
                        {dynamicOptions.availabilities.map((availability: string) => (
                          <option key={availability} value={availability}>{availability}</option>
                        ))}
                      </select>
                      {optionsError && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><span>⚠️</span> Error loading options</p>}
                    </div>
                  </div>
                </div>
                
                {/* Location Information Section */}
                <div className="bg-slate-50/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-sm">📍</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Location Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Area <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="area"
                        value={data.area}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        disabled={optionsLoading}
                        required
                      >
                        {dynamicOptions.areas.map((area: string) => (
                          <option key={area} value={area}>📍 {area}</option>
                        ))}
                      </select>
                      {optionsError && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><span>⚠️</span> Error loading options</p>}
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Full Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={data.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Enter complete address"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Financial Information Section */}
                <div className="bg-slate-50/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <span className="text-emerald-600 text-sm">💰</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Financial Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Rent/Sell Price <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-3 text-slate-500">₹</span>
                        <input
                          type="text"
                          name="rent_or_sell_price"
                          value={data.rent_or_sell_price}
                          onChange={handleInputChange}
                          className="w-full pl-8 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          placeholder="Enter amount"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Security Deposit
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-3 text-slate-500">₹</span>
                        <input
                          type="text"
                          name="deposit"
                          value={data.deposit}
                          onChange={handleInputChange}
                          className="w-full pl-8 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          placeholder="Enter deposit amount"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information Section */}
                <div className="bg-slate-50/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-sm">📝</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Additional Information</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Additional Details
                      </label>
                      <textarea
                        name="additional_details"
                        value={data.additional_details}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                        rows={4}
                        placeholder="Enter any additional property details, amenities, nearby landmarks, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Special Notes
                      </label>
                      <textarea
                        name="special_note"
                        value={data.special_note}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                        rows={3}
                        placeholder="Any special notes, restrictions, or important information"
                      />
                    </div>

                    {/* Enhanced Visibility Toggle */}
                    <div className="bg-white/80 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center h-6">
                          <input
                            type="checkbox"
                            id="visibility"
                            name="visibility"
                            checked={data.visibility}
                            onChange={(e) => setData(prev => ({ ...prev, visibility: e.target.checked }))}
                            className="w-5 h-5 text-blue-600 bg-white border-2 border-slate-300 rounded focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                          />
                        </div>
                        <div className="flex-1">
                          <label htmlFor="visibility" className="block text-sm font-medium text-slate-700 cursor-pointer">
                            Make this property visible to customers
                          </label>
                          <p className="text-sm text-slate-500 mt-1">
                            {data.visibility ? (
                              <span className="flex items-center gap-1 text-green-600">
                                <span>✅</span> This property will be visible in the customer portal
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-orange-600">
                                <span>🔒</span> This property will be hidden from customers
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Footer */}
            <div className="bg-slate-50/80 backdrop-blur-sm border-t border-slate-200/50 px-6 py-4 rounded-b-2xl flex-shrink-0">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                  <span>All required fields must be filled</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-400 focus:ring-2 focus:ring-slate-500 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-medium shadow-lg flex items-center gap-2"
                  >
                    <span>{mode === 'edit' ? '✏️' : '➕'}</span>
                    {mode === 'edit' ? 'Update Property' : 'Add Property'}
                  </button>
                </div>
              </div>
            </div>
        </form>
      </div>
    </div>
  );

  return typeof window !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
};

// Export the PropertyData type for use in other components
export type { PropertyData };
