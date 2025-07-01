"use client";

import React from 'react';
import { PropertyData } from '@/lib/dummyProperties';
import ContactField from '@/components/ui/ContactField';

interface MasterTableViewProps {
  properties: PropertyData[];
  loading: boolean;
  toggleContactVisibility: (propertyId: string) => void;
  isContactVisible: (propertyId: string) => boolean;
  getVisibleContactsCount: () => number;
  onToggleRentSoldOut?: (serialNumber: number, rentSoldOut: boolean) => void;
  canEditRentSoldOut?: boolean;
}

const MasterTableView: React.FC<MasterTableViewProps> = ({ 
  properties, 
  loading, 
  toggleContactVisibility, 
  isContactVisible,
  onToggleRentSoldOut,
  canEditRentSoldOut = false
}) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead className="bg-white/10 border-b border-white/20 sticky top-0">
        <tr>
          <th className="px-3 py-2 text-left text-white font-medium">Serial #</th>
          <th className="px-3 py-2 text-left text-white font-medium">Owner Name</th>
          <th className="px-3 py-2 text-left text-white font-medium">Owner Contact</th>
          <th className="px-3 py-2 text-left text-white font-medium">Rent/Sell Price</th>
          <th className="px-3 py-2 text-left text-white font-medium">Property ID</th>
          <th className="px-3 py-2 text-left text-white font-medium">Property Type</th>
          <th className="px-3 py-2 text-left text-white font-medium">Special Note</th>
          <th className="px-3 py-2 text-left text-white font-medium">Area</th>
          <th className="px-3 py-2 text-left text-white font-medium">Address</th>
          <th className="px-3 py-2 text-left text-white font-medium">Sub Property Type</th>
          <th className="px-3 py-2 text-left text-white font-medium">Size</th>
          <th className="px-3 py-2 text-left text-white font-medium">Furnishing Status</th>
          <th className="px-3 py-2 text-left text-white font-medium">Availability</th>
          <th className="px-3 py-2 text-left text-white font-medium">Floor</th>
          <th className="px-3 py-2 text-left text-white font-medium">Tenant Preference</th>
          <th className="px-3 py-2 text-left text-white font-medium">Additional Details</th>
          <th className="px-3 py-2 text-left text-white font-medium">Age</th>
          <th className="px-3 py-2 text-left text-white font-medium">Deposit</th>
          <th className="px-3 py-2 text-left text-white font-medium">Date Stamp</th>
          <th className="px-3 py-2 text-left text-white font-medium">Rent Sold Out</th>
        </tr>
      </thead>
      <tbody>
        {properties.length > 0 ? (
          properties.map((property, index) => (
            <tr key={property.serial_number || index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="px-3 py-2 text-white/60 font-mono text-xs">{property.serial_number || 'N/A'}</td>
              <td className="px-3 py-2 text-yellow-400 text-xs">{property.owner_name || 'N/A'}</td>
              <td className="px-3 py-2">
                <ContactField
                  contact={property.owner_contact}
                  propertyId={String(property.serial_number || index)}
                  isVisible={isContactVisible(String(property.serial_number || index))}
                  onToggle={toggleContactVisibility}
                  className="text-xs"
                  showIcon={false}
                />
              </td>
              <td className="px-3 py-2 text-green-400 font-semibold text-xs">
                {property.rent_or_sell_price ? `₹${parseFloat(property.rent_or_sell_price).toLocaleString()}` : 'N/A'}
              </td>
              <td className="px-3 py-2 text-white/60 font-mono text-xs">{property.property_id || 'N/A'}</td>
              <td className="px-3 py-2 text-white/80 text-xs">
                {property.property_type === 'Res_rental' ? 'Residential Rent' :
                 property.property_type === 'Res_resale' ? 'Residential Resale' :
                 property.property_type === 'Com_rental' ? 'Commercial Rent' :
                 property.property_type === 'Com_resale' ? 'Commercial Resale' :
                 property.property_type || 'N/A'}
              </td>
              <td className="px-3 py-2 text-white/80 text-xs max-w-32 truncate" title={property.special_note || 'N/A'}>
                {property.special_note || 'N/A'}
              </td>
              <td className="px-3 py-2 text-white/80 text-xs">{property.area || 'N/A'}</td>
              <td className="px-3 py-2 text-white/80 text-xs max-w-32 truncate" title={property.address || 'N/A'}>
                {property.address || 'N/A'}
              </td>
              <td className="px-3 py-2 text-white/80 text-xs">{property.sub_property_type || 'N/A'}</td>
              <td className="px-3 py-2 text-white/80 text-xs">{property.size || 'N/A'}</td>
              <td className="px-3 py-2 text-white/80 text-xs">{property.furnishing_status || 'N/A'}</td>
              <td className="px-3 py-2 text-white/80 text-xs">{property.availability || 'N/A'}</td>
              <td className="px-3 py-2 text-white/80 text-xs">{property.floor || 'N/A'}</td>
              <td className="px-3 py-2 text-white/80 text-xs">{property.tenant_preference || 'N/A'}</td>
              <td className="px-3 py-2 text-white/80 text-xs max-w-32 truncate" title={property.additional_details || 'N/A'}>
                {property.additional_details || 'N/A'}
              </td>
              <td className="px-3 py-2 text-white/80 text-xs">{property.age || 'N/A'}</td>
              <td className="px-3 py-2 text-white/80 text-xs">
                {property.deposit ? `₹${parseFloat(property.deposit).toLocaleString()}` : 'N/A'}
              </td>
              <td className="px-3 py-2 text-white/80 text-xs">{property.date_stamp || 'N/A'}</td>
              <td className="px-3 py-2 text-xs">
                {canEditRentSoldOut && onToggleRentSoldOut ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(property.rent_sold_out)}
                      onChange={(e) => onToggleRentSoldOut(property.serial_number, e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-white/10 border-white/30 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className={`text-xs font-medium ${
                      property.rent_sold_out ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {property.rent_sold_out ? 'Sold/Rented' : 'Available'}
                    </span>
                  </div>
                ) : (
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    property.rent_sold_out ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {property.rent_sold_out ? 'Sold Out' : 'Available'}
                  </span>
                )}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={20} className="px-4 py-8 text-center text-white/60">
              {loading ? 'Loading properties...' : 'No properties found matching your criteria'}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default MasterTableView;
