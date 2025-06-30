"use client";

import React from 'react';
import { PropertyData } from '@/lib/dummyProperties';
import ContactField from '@/components/ui/ContactField';

interface CompactTableViewProps {
  properties: PropertyData[];
  loading: boolean;
  toggleContactVisibility: (propertyId: string) => void;
  isContactVisible: (propertyId: string) => boolean;
  getVisibleContactsCount: () => number;
}

const CompactTableView: React.FC<CompactTableViewProps> = ({ 
  properties, 
  loading, 
  toggleContactVisibility, 
  isContactVisible 
}) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead className="bg-white/10 border-b border-white/20">
        <tr>
          <th className="px-2 py-2 text-left text-white font-medium">#</th>
          <th className="px-2 py-2 text-left text-white font-medium">Type</th>
          <th className="px-2 py-2 text-left text-white font-medium">Owner</th>
          <th className="px-2 py-2 text-left text-white font-medium">Area</th>
          <th className="px-2 py-2 text-left text-white font-medium">Price</th>
          <th className="px-2 py-2 text-left text-white font-medium">Size</th>
          <th className="px-2 py-2 text-left text-white font-medium">Status</th>
          <th className="px-2 py-2 text-left text-white font-medium">Contact</th>
        </tr>
      </thead>
      <tbody>
        {properties.length > 0 ? (
          properties.map((property, index) => (
            <tr key={property.serial_number || index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="px-2 py-2 text-white/60 font-mono text-xs">{property.serial_number}</td>
              <td className="px-2 py-2 text-white/80">
                <span className="text-xs">
                  {property.property_type === 'Res_rental' ? 'Residential Rent' :
                   property.property_type === 'Res_resale' ? 'Residential Resale' :
                   property.property_type === 'Com_rental' ? 'Commercial Rent' :
                   property.property_type === 'Com_resale' ? 'Commercial Resale' :
                   property.property_type || 'N/A'}
                </span>
              </td>
              <td className="px-2 py-2 text-yellow-400 text-xs">{property.owner_name || 'N/A'}</td>
              <td className="px-2 py-2 text-white/80 text-xs">{property.area || 'N/A'}</td>
              <td className="px-2 py-2 text-green-400 font-semibold text-xs">
                {property.rent_or_sell_price ? `₹${parseFloat(property.rent_or_sell_price).toLocaleString()}` : 'N/A'}
              </td>
              <td className="px-2 py-2 text-white/80 text-xs">{property.size || 'N/A'}</td>
              <td className="px-2 py-2 text-white/80 text-xs">{property.availability || 'N/A'}</td>
              <td className="px-2 py-2">
                <ContactField
                  contact={property.owner_contact}
                  propertyId={String(property.serial_number || index)}
                  isVisible={isContactVisible(String(property.serial_number || index))}
                  onToggle={toggleContactVisibility}
                  className="text-xs"
                  showIcon={false}
                />
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={8} className="px-4 py-8 text-center text-white/60">
              {loading ? 'Loading properties...' : 'No properties found matching your criteria'}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default CompactTableView;
