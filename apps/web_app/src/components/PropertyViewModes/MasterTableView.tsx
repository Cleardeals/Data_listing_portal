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
}

function MasterTableView({
  properties,
  loading,
  toggleContactVisibility,
  isContactVisible,
}: MasterTableViewProps) {
  return (
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
          <th className="px-3 py-2 text-left text-white font-medium">Deposit</th>
          <th className="px-3 py-2 text-left text-white font-medium">Date Stamp</th>
          <th className="px-3 py-2 text-left text-white font-medium">Source</th>
          <th className="px-3 py-2 text-left text-white font-medium">Location</th>
        </tr>
      </thead>
      <tbody>
        {properties.length > 0 ? (
          properties.map((property, index) => (
            <tr key={property.serial_number || index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="px-3 py-2 text-white/60 font-mono text-xs">{property.serial_number || '—'}</td>
              <td className="px-3 py-2 text-yellow-400 text-xs">{property.owner_name || '—'}</td>
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
                {property.rent_or_sell_price
                  ? (() => {
                      const cleaned = property.rent_or_sell_price.replace(/[,\s]/g, '');
                      const num = parseFloat(cleaned);
                      return isNaN(num) ? property.rent_or_sell_price : `₹${num.toLocaleString()}`;
                    })()
                  : '—'}
              </td>
              <td className="px-3 py-2 text-white/60 font-mono text-xs">{property.property_id || '—'}</td>
              <td className="px-3 py-2 text-white/80 text-xs">
                {property.property_type === 'Res_rental' ? 'Residential Rent' :
                 property.property_type === 'Res_resale' ? 'Residential Resale' :
                 property.property_type === 'Com_rental' ? 'Commercial Rent' :
                 property.property_type === 'Com_resale' ? 'Commercial Resale' :
                 property.property_type || '—'}
              </td>
              <td className="px-3 py-2 text-white/80 text-xs max-w-32 truncate" title={property.special_note || ''}>
                {property.special_note || '—'}
              </td>
              <td className="px-3 py-2 text-white/80 text-xs">{property.area || '—'}</td>
              <td className="px-3 py-2 text-white/80 text-xs max-w-32 truncate" title={property.address || ''}>
                {property.address || '—'}
              </td>
              <td className="px-3 py-2 text-white/80 text-xs">{property.sub_property_type || '—'}</td>
              <td className="px-3 py-2 text-white/80 text-xs">{property.size || '—'}</td>
              <td className="px-3 py-2 text-white/80 text-xs">{property.furnishing_status || '—'}</td>
              <td className="px-3 py-2 text-white/80 text-xs">{property.availability || '—'}</td>
              <td className="px-3 py-2 text-white/80 text-xs">{property.floor || '—'}</td>
              <td className="px-3 py-2 text-white/80 text-xs">{property.tenant_preference || '—'}</td>
              <td className="px-3 py-2 text-white/80 text-xs max-w-32 truncate" title={property.additional_details || ''}>
                {property.additional_details || '—'}
              </td>
              <td className="px-3 py-2 text-white/80 text-xs">
                {property.deposit ? `₹${parseFloat(property.deposit).toLocaleString()}` : '—'}
              </td>
              <td className="px-3 py-2 text-white/80 text-xs">{property.date_stamp || '—'}</td>
              <td className="px-3 py-2 text-white/60 text-xs">{property.source || '—'}</td>
              <td className="px-3 py-2 text-xs">
                <button
                  onClick={() => {
                    const query = encodeURIComponent(`${property.area || ''} ${property.address || ''}`.trim() || 'Property Location');
                    window.open(`https://www.google.com/maps/search/${query}`, '_blank');
                  }}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 rounded transition-colors"
                >
                  <span className="text-sm">🗺️</span>
                  <span className="text-xs">Maps</span>
                </button>
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
}

export default MasterTableView;
