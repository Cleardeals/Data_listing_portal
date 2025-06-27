"use client";

import React from 'react';
import { PropertyData } from '@/lib/dummyProperties';

interface GalleryViewProps {
  properties: PropertyData[];
  loading: boolean;
}

const GalleryView: React.FC<GalleryViewProps> = ({ properties, loading }) => {
  if (loading || properties.length === 0) {
    return (
      <div className="text-center py-8 text-white/60">
        {loading ? 'Loading properties...' : 'No properties found matching your criteria'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {properties.map((property, index) => (
        <div key={property.serial_number || index} className="card-hover-3d backdrop-blur-sm bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:border-blue-400/40">
          {/* Dummy Image/Icon */}
          <div className="h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border-b border-white/20">
            <div className="text-center">
              <div className="text-6xl mb-2">
                {property.property_type?.includes('Res') ? '🏠' : '🏢'}
              </div>
              <div className="text-xs text-white/60">Property Image</div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-sm font-semibold text-white line-clamp-1">
                {property.sub_property_type || property.property_type || 'Property'}
              </h3>
              <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded">
                #{property.serial_number}
              </span>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-blue-400 text-sm">📍</span>
                <span className="text-white/80 text-xs line-clamp-1">{property.area || 'N/A'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-purple-400 text-sm">📐</span>
                <span className="text-white/80 text-xs">{property.size || 'N/A'}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-green-400 font-bold text-sm">
                {property.rent_or_sell_price ? `₹${parseFloat(property.rent_or_sell_price).toLocaleString()}` : 'Price N/A'}
              </div>
              <div className="text-xs text-white/60">
                {property.availability || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GalleryView;
