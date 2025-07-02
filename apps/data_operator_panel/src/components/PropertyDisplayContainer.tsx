"use client";

import React from 'react';
import { SupabasePropertyData } from '@/lib/propertyData';

interface PropertyDisplayContainerProps {
  properties: SupabasePropertyData[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  onEditProperty: (serialNumber: number) => void;
  onDeleteProperty: (serialNumber: number) => void;
  onToggleRentSoldOut: (serialNumber: number, rentSoldOut: boolean) => void;
  onToggleVisibility: (serialNumber: number, visibility: boolean) => void;
}

const PropertyDisplayContainer: React.FC<PropertyDisplayContainerProps> = ({
  properties,
  loading,
  error,
  totalCount,
  onEditProperty,
  onDeleteProperty,
  onToggleRentSoldOut,
  onToggleVisibility,
}) => {
  const renderTableView = () => (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full border-collapse min-w-[1700px]">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider border-r border-slate-600/50 w-20">
                <div className="flex items-center gap-2">
                  <span className="text-blue-300">#</span>
                  Serial
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider border-r border-slate-600/50 w-28">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-300">🏠</span>
                  Property ID
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider border-r border-slate-600/50 w-40">
                <div className="flex items-center gap-2">
                  <span className="text-purple-300">🏢</span>
                  Property Type
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider border-r border-slate-600/50 w-48">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-300">💡</span>
                  Special Note
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider border-r border-slate-600/50 w-28">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-300">📅</span>
                  Date
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider border-r border-slate-600/50 w-40">
                <div className="flex items-center gap-2">
                  <span className="text-orange-300">👤</span>
                  Owner Name
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider border-r border-slate-600/50 w-32">
                <div className="flex items-center gap-2">
                  <span className="text-green-300">📞</span>
                  Contact
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider border-r border-slate-600/50 w-56">
                <div className="flex items-center gap-2">
                  <span className="text-pink-300">📍</span>
                  Address
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider border-r border-slate-600/50 w-32">
                <div className="flex items-center gap-2">
                  <span className="text-amber-300">🗺️</span>
                  Area
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider border-r border-slate-600/50 w-40">
                <div className="flex items-center gap-2">
                  <span className="text-indigo-300">🏘️</span>
                  Sub Property Type
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider border-r border-slate-600/50 w-28">
                <div className="flex items-center gap-2">
                  <span className="text-teal-300">📐</span>
                  Size
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider border-r border-slate-600/50 w-32">
                <div className="flex items-center gap-2">
                  <span className="text-rose-300">🪑</span>
                  Furnishing
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider border-r border-slate-600/50 w-32">
                <div className="flex items-center gap-2">
                  <span className="text-lime-300">✅</span>
                  Availability
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider border-r border-slate-600/50 w-24">
                <div className="flex items-center gap-2">
                  <span className="text-sky-300">🏗️</span>
                  Floor
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider border-r border-slate-600/50 w-40">
                <div className="flex items-center gap-2">
                  <span className="text-violet-300">👥</span>
                  Tenant Preference
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider border-r border-slate-600/50 w-24">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-300">⏰</span>
                  Age
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider border-r border-slate-600/50 w-32">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-300">💰</span>
                  Price
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider border-r border-slate-600/50 w-28">
                <div className="flex items-center gap-2">
                  <span className="text-blue-300">💵</span>
                  Deposit
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider border-r border-slate-600/50 w-48">
                <div className="flex items-center gap-2">
                  <span className="text-orange-300">📝</span>
                  Additional Details
                </div>
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider border-r border-slate-600/50 w-32">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-red-300">🏷️</span>
                  Status
                </div>
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider border-r border-slate-600/50 w-32">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-cyan-300">👁️</span>
                  Visibility
                </div>
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider border-r border-slate-600/50 w-20">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-blue-300">✏️</span>
                  Edit
                </div>
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider w-20">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-red-300">🗑️</span>
                  Delete
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200/60">
            {loading ? (
              <tr>
                <td colSpan={23} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-l-blue-400 rounded-full animate-ping"></div>
                    </div>
                    <div className="text-lg font-semibold text-slate-700">Loading Properties...</div>
                    <div className="text-sm text-slate-500">Please wait while we fetch your data</div>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={23} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
                      <span className="text-3xl">⚠️</span>
                    </div>
                    <div className="text-lg font-semibold text-red-600">Error Loading Properties</div>
                    <div className="text-sm text-red-500 max-w-md text-center">{error}</div>
                    <button 
                      onClick={() => window.location.reload()} 
                      className="mt-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      Try Again
                    </button>
                  </div>
                </td>
              </tr>
            ) : properties.length === 0 ? (
              <tr>
                <td colSpan={23} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-3xl">📋</span>
                    </div>
                    <div className="text-lg font-semibold text-slate-600">No Properties Found</div>
                    <div className="text-sm text-slate-500">Try adjusting your filters or search criteria</div>
                  </div>
                </td>
              </tr>
            ) : (
              properties.map((property, index) => (
                <tr key={property.serial_number} className={`text-slate-800 hover:bg-blue-50/50 transition-colors duration-200 border-b border-slate-200/50 ${
                  property.rent_sold_out 
                    ? 'bg-red-50/60 border-l-4 border-red-400/60' 
                    : index % 2 === 0 
                      ? 'bg-white' 
                      : 'bg-slate-50/40'
                }`}>
                  <td className="px-4 py-3 border-r border-slate-200/60 text-center">
                    <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded font-semibold">#{property.serial_number}</span>
                  </td>
                  <td className="px-4 py-3 border-r border-slate-200/60 text-center">
                    <span className="font-mono text-xs text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded">{property.property_id}</span>
                  </td>
                  <td className="px-4 py-3 border-r border-slate-200/60 text-center">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      property.property_type === 'Res_resale' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                      property.property_type === 'Res_rental' ? 'bg-green-100 text-green-800 border border-green-300' :
                      property.property_type === 'Com_resale' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                      property.property_type === 'Com_rental' ? 'bg-orange-100 text-orange-800 border border-orange-300' : 
                      'bg-gray-100 text-gray-800 border border-gray-300'
                    }`}>
                      {property.property_type === 'Res_resale' ? '🏠 Res Sale' :
                       property.property_type === 'Res_rental' ? '🏠 Res Rent' :
                       property.property_type === 'Com_resale' ? '🏢 Com Sale' :
                       property.property_type === 'Com_rental' ? '🏢 Com Rent' : 
                       property.property_type || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-r border-slate-200/60 align-top">
                    <div className="text-xs text-slate-700 max-w-xs">
                      {property.special_note ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                          <span className="break-words">{property.special_note}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No notes</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-slate-200/60 text-center">
                    <span className="text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded font-medium">
                      {property.date_stamp ? new Date(property.date_stamp).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      }) : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-r border-slate-200/60">
                    <div className="text-xs font-semibold text-slate-900 max-w-xs">
                      {property.owner_name ? (
                        <div className="bg-indigo-50 border border-indigo-200 rounded p-2">
                          {property.owner_name}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No name</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-slate-200/60">
                    <div className="text-xs text-slate-700 max-w-xs">
                      {property.owner_contact ? (
                        <a href={`tel:${property.owner_contact}`} className="text-blue-600 hover:text-blue-800 font-medium bg-blue-50 border border-blue-200 rounded p-2 block hover:bg-blue-100 transition-colors">
                          📞 {property.owner_contact}
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">No contact</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-slate-200/60">
                    <div className="text-xs text-slate-700 max-w-xs">
                      <div className="bg-green-50 border border-green-200 rounded p-2">
                        <span className="break-words">{property.address}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-slate-200/60">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded border border-amber-200">
                      📍 {property.area}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-r border-slate-200/60">
                    <div className="text-xs text-slate-700 max-w-xs">
                      <div className="bg-pink-50 border border-pink-200 rounded p-2">
                        <span className="break-words">{property.sub_property_type}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-slate-200/60 text-center">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded border border-yellow-200">
                      {property.size || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-r border-slate-200/60">
                    <div className="text-xs text-slate-700 max-w-xs">
                      <div className="bg-teal-50 border border-teal-200 rounded p-2">
                        <span className="break-words">{property.furnishing_status}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-slate-200/60">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded border border-green-200">
                      {property.availability}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-r border-slate-200/60 text-center">
                    <span className="text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded">{property.floor}</span>
                  </td>
                  <td className="px-4 py-3 border-r border-slate-200/60">
                    <div className="text-xs text-slate-700 max-w-xs">
                      <div className="bg-violet-50 border border-violet-200 rounded p-2">
                        <span className="break-words">{property.tenant_preference}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-slate-200/60 text-center">
                    <span className="text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded">{property.age}</span>
                  </td>
                  <td className="px-4 py-3 border-r border-slate-200/60">
                    <div className="text-sm font-bold text-green-600 max-w-xs">
                      <div className="bg-green-100 border border-green-300 rounded p-2">
                        <span className="break-words">💰 {property.rent_or_sell_price}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-slate-200/60">
                    <div className="text-xs text-slate-700 max-w-xs">
                      <div className="bg-blue-50 border border-blue-200 rounded p-2">
                        <span className="break-words">{property.deposit}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-slate-200/60">
                    <div className="text-xs text-slate-700 max-w-xs">
                      {property.additional_details ? (
                        <div className="bg-orange-50 border border-orange-200 rounded p-2">
                          <span className="break-words">{property.additional_details}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No details</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-slate-200/60 text-center">
                    <div className="flex justify-center items-center">
                      <label className="inline-flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={Boolean(property.rent_sold_out)}
                          onChange={(e) => onToggleRentSoldOut(property.serial_number, e.target.checked)}
                          className="w-4 h-4 text-red-600 bg-white border-2 border-red-300 rounded focus:ring-red-500 cursor-pointer"
                        />
                        <span className={`ml-2 text-xs font-medium px-2 py-1 rounded ${
                          property.rent_sold_out 
                            ? 'text-red-700 bg-red-100 border border-red-300' 
                            : 'text-green-700 bg-green-100 border border-green-300'
                        }`}>
                          {property.rent_sold_out ? '❌ Sold' : '✅ Available'}
                        </span>
                      </label>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-slate-200/60 text-center">
                    <div className="flex justify-center items-center">
                      <label className="inline-flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={Boolean(property.visibility)}
                          onChange={(e) => onToggleVisibility(property.serial_number, e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-white border-2 border-blue-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <span className={`ml-2 text-xs font-medium px-2 py-1 rounded ${
                          property.visibility 
                            ? 'text-blue-700 bg-blue-100 border border-blue-300' 
                            : 'text-slate-600 bg-slate-100 border border-slate-300'
                        }`}>
                          {property.visibility ? '👁️ Visible' : '🙈 Hidden'}
                        </span>
                      </label>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-slate-200/60 text-center">
                    <button
                      onClick={() => onEditProperty(property.serial_number)}
                      className="inline-flex items-center px-3 py-2 border border-blue-300 text-xs font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                      title="Edit Property"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onDeleteProperty(property.serial_number)}
                      className="inline-flex items-center px-3 py-2 border border-red-300 text-xs font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                      title="Delete Property"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
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
    <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg shadow-lg overflow-hidden">
      {/* View Mode Header */}
      <div className="bg-slate-100/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-slate-800">
              📊 Property Data Table
            </h3>
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              <span className="text-blue-600 font-semibold text-sm">{properties.length.toLocaleString()}</span>
              <span className="text-slate-600 text-sm">of</span>
              <span className="text-purple-600 font-semibold text-sm">{totalCount.toLocaleString()}</span>
              <span className="text-slate-600 text-sm">properties</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span>Real-time data</span>
          </div>
        </div>
      </div>

      {/* Content based on view mode - for now, only table view */}
      <div className="p-4">
        {renderTableView()}
      </div>
    </div>
  );
};

export default PropertyDisplayContainer;
