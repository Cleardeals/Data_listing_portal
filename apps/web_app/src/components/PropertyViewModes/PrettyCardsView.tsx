"use client";

import React from 'react';
import { PropertyData } from '@/lib/dummyProperties';

interface PrettyCardsViewProps {
  properties: PropertyData[];
  loading: boolean;
}

const PrettyCardsView: React.FC<PrettyCardsViewProps> = ({ properties, loading }) => {
  if (loading || properties.length === 0) {
    return (
      <div className="text-center py-8 text-white/60">
        {loading ? 'Loading properties...' : 'No properties found matching your criteria'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property, index) => (
        <div key={property.serial_number || index} className="card-hover-3d backdrop-blur-sm bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:border-blue-400/40">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 rounded-full">
                <span className="text-2xl">
                  {property.property_type?.includes('Res') ? '🏠' : '🏢'}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{property.property_type || 'Property'}</h3>
                <p className="text-sm text-white/70">{property.sub_property_type || 'N/A'}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-green-400">
                {property.rent_or_sell_price ? `₹${parseFloat(property.rent_or_sell_price).toLocaleString()}` : 'N/A'}
              </div>
              <div className="text-xs text-white/60">#{property.serial_number}</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-blue-400">📍</span>
              <span className="text-white/80 text-sm">{property.area || 'Location not specified'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-purple-400">📐</span>
              <span className="text-white/80 text-sm">{property.size || 'Size not specified'}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-orange-400">🛋️</span>
              <span className="text-white/80 text-sm">{property.furnishing_status || 'N/A'}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-green-400">✅</span>
              <span className="text-white/80 text-sm">{property.availability || 'N/A'}</span>
            </div>

            {property.owner_contact && (
              <div className="flex items-center gap-2">
                <span className="text-cyan-400">📞</span>
                <span className="text-white/80 text-sm">{property.owner_contact}</span>
              </div>
            )}
          </div>

          {property.additional_details && (
            <div className="mt-4 pt-3 border-t border-white/10">
              <p className="text-xs text-white/60 line-clamp-2">{property.additional_details}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PrettyCardsView;
