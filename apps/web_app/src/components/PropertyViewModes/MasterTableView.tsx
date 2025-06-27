"use client";

import React from 'react';
import { PropertyData } from '@/lib/dummyProperties';

interface MasterTableViewProps {
  properties: PropertyData[];
  loading: boolean;
}

const MasterTableView: React.FC<MasterTableViewProps> = ({ properties, loading }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead className="bg-white/10 border-b border-white/20 sticky top-0">
        <tr>
          <th className="px-3 py-2 text-left text-white font-medium">#</th>
          <th className="px-3 py-2 text-left text-white font-medium">ID</th>
          <th className="px-3 py-2 text-left text-white font-medium">Type</th>
          <th className="px-3 py-2 text-left text-white font-medium">Sub Type</th>
          <th className="px-3 py-2 text-left text-white font-medium">Area</th>
          <th className="px-3 py-2 text-left text-white font-medium">Address</th>
          <th className="px-3 py-2 text-left text-white font-medium">Size</th>
          <th className="px-3 py-2 text-left text-white font-medium">Price</th>
          <th className="px-3 py-2 text-left text-white font-medium">Deposit</th>
          <th className="px-3 py-2 text-left text-white font-medium">Furnishing</th>
          <th className="px-3 py-2 text-left text-white font-medium">Availability</th>
          <th className="px-3 py-2 text-left text-white font-medium">Floor</th>
          <th className="px-3 py-2 text-left text-white font-medium">Age</th>
          <th className="px-3 py-2 text-left text-white font-medium">Tenant Pref</th>
          <th className="px-3 py-2 text-left text-white font-medium">Owner</th>
          <th className="px-3 py-2 text-left text-white font-medium">Contact</th>
          <th className="px-3 py-2 text-left text-white font-medium">Special Note</th>
          <th className="px-3 py-2 text-left text-white font-medium">Additional Details</th>
        </tr>
      </thead>
      <tbody>
        {properties.length > 0 ? (
          properties.map((property, index) => (
            <tr key={property.serial_number || index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="px-3 py-2 text-white/60 font-mono text-xs">{index + 1}</td>
              <td className="px-3 py-2 text-white/60 font-mono text-xs">{property.serial_number}</td>
              <td className="px-3 py-2 text-white/80 text-xs">
                {property.property_type === 'Res_rental' ? 'Residential Rent' :
                 property.property_type === 'Res_resale' ? 'Residential Resale' :
                 property.property_type === 'Com_rental' ? 'Commercial Rent' :
                 property.property_type === 'Com_resale' ? 'Commercial Resale' :
                 property.property_type || 'N/A'}
              </td>
              <td className="px-3 py-2 text-white/80 text-xs">{property.sub_property_type || 'N/A'}</td>
              <td className="px-3 py-2 text-white/80 text-xs">{property.area || 'N/A'}</td>
              <td className="px-3 py-2 text-white/80 text-xs max-w-32 truncate" title={property.address || 'N/A'}>
                {property.address || 'N/A'}
              </td>
              <td className="px-3 py-2 text-white/80 text-xs">{property.size || 'N/A'}</td>
              <td className="px-3 py-2 text-green-400 font-semibold text-xs">
                {property.rent_or_sell_price ? `₹${parseFloat(property.rent_or_sell_price).toLocaleString()}` : 'N/A'}
              </td>
              <td className="px-3 py-2 text-white/80 text-xs">
                {property.deposit ? `₹${parseFloat(property.deposit).toLocaleString()}` : 'N/A'}
              </td>
              <td className="px-3 py-2 text-white/80 text-xs">{property.furnishing_status || 'N/A'}</td>
              <td className="px-3 py-2 text-white/80 text-xs">{property.availability || 'N/A'}</td>
              <td className="px-3 py-2 text-white/80 text-xs">{property.floor || 'N/A'}</td>
              <td className="px-3 py-2 text-white/80 text-xs">{property.age || 'N/A'}</td>
              <td className="px-3 py-2 text-white/80 text-xs">{property.tenant_preference || 'N/A'}</td>
              <td className="px-3 py-2 text-yellow-400 text-xs">{property.owner_name || 'N/A'}</td>
              <td className="px-3 py-2 text-cyan-400 text-xs">{property.owner_contact || 'N/A'}</td>
              <td className="px-3 py-2 text-white/80 text-xs max-w-32 truncate" title={property.special_note || 'N/A'}>
                {property.special_note || 'N/A'}
              </td>
              <td className="px-3 py-2 text-white/80 text-xs max-w-32 truncate" title={property.additional_details || 'N/A'}>
                {property.additional_details || 'N/A'}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={18} className="px-4 py-8 text-center text-white/60">
              {loading ? 'Loading properties...' : 'No properties found matching your criteria'}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default MasterTableView;
