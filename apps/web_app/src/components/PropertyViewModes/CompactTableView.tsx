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

function RemarksBadge({ value }: { value?: string | null }) {
  if (!value) return <span className="text-white/30 text-xs">—</span>;
  if (value === 'Verified') {
    return <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400 whitespace-nowrap">✓ Verified</span>;
  }
  if (value.startsWith('Verification Pending')) {
    return <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-400 whitespace-nowrap">⏳ Pending</span>;
  }
  return <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/60">{value}</span>;
}

function CompactTableView({
  properties,
  loading,
  toggleContactVisibility,
  isContactVisible
}: CompactTableViewProps) {
  return (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead className="bg-white/10 border-b border-white/20">
        <tr>
          <th className="px-2 py-2 text-left text-white font-medium">#</th>
          <th className="px-2 py-2 text-left text-white font-medium">Type</th>
          <th className="px-2 py-2 text-left text-white font-medium">Owner</th>
          <th className="px-2 py-2 text-left text-white font-medium">Area</th>
          <th className="px-2 py-2 text-left text-white font-medium">Source</th>
          <th className="px-2 py-2 text-left text-white font-medium">Price</th>
          <th className="px-2 py-2 text-left text-white font-medium">Remarks</th>
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
                   property.property_type || '—'}
                </span>
              </td>
              <td className="px-2 py-2 text-yellow-400 text-xs">{property.owner_name || '—'}</td>
              <td className="px-2 py-2 text-white/80 text-xs">{property.area || '—'}</td>
              <td className="px-2 py-2 text-white/60 text-xs">{property.source || '—'}</td>
              <td className="px-2 py-2 text-green-400 font-semibold text-xs">
                {property.rent_or_sell_price
                  ? (() => {
                      const cleaned = property.rent_or_sell_price.replace(/[,\s]/g, '');
                      const num = parseFloat(cleaned);
                      return isNaN(num) ? property.rent_or_sell_price : `₹${num.toLocaleString()}`;
                    })()
                  : '—'}
              </td>
              <td className="px-2 py-2">
                <RemarksBadge value={property.remarks} />
              </td>
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
}

export default CompactTableView;
