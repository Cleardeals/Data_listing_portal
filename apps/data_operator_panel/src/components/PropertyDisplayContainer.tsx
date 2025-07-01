"use client";

import React from 'react';
import { SupabasePropertyData } from '@/lib/propertyData';
import { ViewMode } from './PropertyFiltersPanel';

interface PropertyDisplayContainerProps {
  properties: SupabasePropertyData[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  viewMode: ViewMode;
  onEditProperty: (serialNumber: number) => void;
  onDeleteProperty: (serialNumber: number) => void;
  onToggleRentSoldOut: (serialNumber: number, rentSoldOut: boolean) => void;
}

const PropertyDisplayContainer: React.FC<PropertyDisplayContainerProps> = ({
  properties,
  loading,
  error,
  totalCount,
  viewMode,
  onEditProperty,
  onDeleteProperty,
  onToggleRentSoldOut,
}) => {
  const getViewModeTitle = () => {
    switch (viewMode) {
      case 'compact': return '📊 Compact Table';
      case 'gallery': return '🖼️ Gallery View';
      case 'master': return '📜 Master View';
      default: return '📊 Compact Table';
    }
  };

  const renderTableView = () => (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[1600px]">
          <thead>
            <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-20">
                Serial #
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-28">Property ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-40">Property Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-48">Special Note</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-28">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-40">Owner Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-32">Contact</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-56">Address</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-32">Area</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-40">Sub Property Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-28">Size (sq ft)</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-32">Furnishing</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-32">Availability</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-24">Floor</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-40">Tenant Preference</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-24">Age</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-32">
                Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-28">Deposit</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-48">Additional Details</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-32">Status</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider border-r border-slate-600 w-20 sticky right-20 bg-gradient-to-r from-slate-800 to-slate-700 z-10">Edit</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider w-20 sticky right-0 bg-gradient-to-r from-slate-800 to-slate-700 z-10">Delete</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={22} className="px-6 py-12 text-center text-gray-500 text-sm">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span>Loading properties...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={22} className="px-6 py-12 text-center text-red-500 text-sm">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <span className="text-red-600">⚠️ Error: {error}</span>
                  </div>
                </td>
              </tr>
            ) : properties.length === 0 ? (
              <tr>
                <td colSpan={22} className="px-6 py-12 text-center text-gray-500 text-sm">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <span className="text-gray-400">📋 No properties found</span>
                  </div>
                </td>
              </tr>
            ) : (
              properties.map((property, index) => (
                <tr key={property.serial_number} className={`text-gray-900 hover:bg-gray-50 transition-colors duration-150 ${
                  property.rent_sold_out 
                    ? 'bg-red-50/30 border-l-4 border-red-300' 
                    : index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}>
                  <td className="px-4 py-3 border-r border-gray-200 text-center">
                    <span className="font-mono text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">#{property.serial_number}</span>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200 text-center">
                    <span className="font-mono text-sm text-blue-600 font-medium">{property.property_id}</span>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200 text-center">
                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                      property.property_type === 'Res_resale' ? 'bg-blue-100 text-blue-800' :
                      property.property_type === 'Res_rental' ? 'bg-green-100 text-green-800' :
                      property.property_type === 'Com_resale' ? 'bg-purple-100 text-purple-800' :
                      property.property_type === 'Com_rental' ? 'bg-orange-100 text-orange-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {property.property_type === 'Res_resale' ? 'Residential Resale' :
                       property.property_type === 'Res_rental' ? 'Residential Rental' :
                       property.property_type === 'Com_resale' ? 'Commercial Resale' :
                       property.property_type === 'Com_rental' ? 'Commercial Rental' : 
                       property.property_type || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200 align-top">
                    <div className="text-sm text-gray-700 max-w-xs overflow-hidden">
                      {property.special_note ? (
                        <span className="whitespace-pre-line break-words">{property.special_note}</span>
                      ) : (
                        <span className="text-gray-400 italic">No notes</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200 text-center">
                    <span className="text-sm text-gray-600">
                      {property.date_stamp ? new Date(property.date_stamp).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      }) : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="text-sm font-semibold text-gray-900 max-w-xs overflow-hidden">
                      {property.owner_name || <span className="text-gray-400 italic">No name</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="text-sm text-gray-700 max-w-xs overflow-hidden">
                      {property.owner_contact ? (
                        <a href={`tel:${property.owner_contact}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                          {property.owner_contact}
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">No contact</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="text-sm text-gray-700 max-w-xs overflow-hidden">
                      <span className="whitespace-pre-line break-words">{property.address}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    <span className="inline-block px-2 py-1 text-sm font-medium bg-amber-100 text-amber-800 rounded">
                      {property.area}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="text-sm text-gray-700 max-w-xs overflow-hidden">
                      <span className="whitespace-pre-line break-words">{property.sub_property_type}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200 text-center">
                    <span className="inline-block px-2 py-1 text-sm font-medium bg-yellow-100 text-yellow-800 rounded">
                      {property.size || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="text-sm text-gray-700 max-w-xs overflow-hidden">
                      <span className="whitespace-pre-line break-words">{property.furnishing_status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    <span className="inline-block px-2 py-1 text-sm font-medium bg-green-100 text-green-800 rounded">
                      {property.availability}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200 text-center">
                    <span className="text-sm text-gray-700">{property.floor}</span>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="text-sm text-gray-700 max-w-xs overflow-hidden">
                      <span className="whitespace-pre-line break-words">{property.tenant_preference}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200 text-center">
                    <span className="text-sm text-gray-700">{property.age}</span>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="text-sm font-bold text-green-600 max-w-xs overflow-hidden">
                      <span className="whitespace-pre-line break-words">{property.rent_or_sell_price}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="text-sm text-gray-700 max-w-xs overflow-hidden">
                      <span className="whitespace-pre-line break-words">{property.deposit}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="text-sm text-gray-700 max-w-xs overflow-hidden">
                      {property.additional_details ? (
                        <span className="whitespace-pre-line break-words">{property.additional_details}</span>
                      ) : (
                        <span className="text-gray-400 italic">No details</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200 text-center">
                    <div className="flex justify-center items-center">
                      <label className="inline-flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={Boolean(property.rent_sold_out)}
                          onChange={(e) => onToggleRentSoldOut(property.serial_number, e.target.checked)}
                          className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                        />
                        <span className={`ml-2 text-xs font-medium ${
                          property.rent_sold_out 
                            ? 'text-red-600' 
                            : 'text-green-600'
                        } group-hover:underline`}>
                          {property.rent_sold_out ? 'Sold/Rented' : 'Available'}
                        </span>
                      </label>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200 text-center sticky right-20 bg-inherit z-10">
                    <button
                      onClick={() => onEditProperty(property.serial_number)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      title="Edit Property"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center sticky right-0 bg-inherit z-10">
                    <button
                      onClick={() => onDeleteProperty(property.serial_number)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                      title="Delete Property"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* View Mode Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {getViewModeTitle()}
            </h3>
            <div className="text-sm text-gray-600">
              {properties.length.toLocaleString()} of {totalCount.toLocaleString()} properties
            </div>
          </div>
        </div>
      </div>

      {/* Content based on view mode - for now, only table view */}
      <div className="p-6">
        {renderTableView()}
      </div>
    </div>
  );
};

export default PropertyDisplayContainer;
