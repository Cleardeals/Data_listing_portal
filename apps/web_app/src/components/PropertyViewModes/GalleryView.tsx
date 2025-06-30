"use client";

import React from 'react';
import { PropertyData } from '@/lib/dummyProperties';
import ContactField from '@/components/ui/ContactField';

interface GalleryViewProps {
  properties: PropertyData[];
  loading: boolean;
  toggleContactVisibility: (propertyId: string) => void;
  isContactVisible: (propertyId: string) => boolean;
  getVisibleContactsCount: () => number;
}

const GalleryView: React.FC<GalleryViewProps> = ({ 
  properties, 
  loading, 
  toggleContactVisibility, 
  isContactVisible
}) => {
  if (loading || properties.length === 0) {
    return (
      <div className="text-center py-8 text-white/60">
        {loading ? 'Loading properties...' : 'No properties found matching your criteria'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
      {properties.map((property, index) => (
        <div key={property.serial_number || index} className="card-hover-3d backdrop-blur-sm bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-blue-400/40">
          <div className="flex flex-row h-40">
            {/* Image/Icon Section - Left Side */}
            <div className="w-20 h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border-r border-white/20 flex-shrink-0">
              <div className="text-center">
                <div className="text-2xl">
                  {property.property_type?.includes('Res') ? '🏠' : '🏢'}
                </div>
              </div>
            </div>

            {/* Content Section - Right Side */}
            <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
              {/* Top Section - Title and Serial */}
              <div>
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-xs font-semibold text-white line-clamp-1 flex-1 mr-1">
                    {property.sub_property_type || property.property_type || 'Property'}
                  </h3>
                  <span className="text-xs text-white/60 bg-white/10 px-1 py-0.5 rounded text-nowrap">
                    #{property.serial_number}
                  </span>
                </div>

                {/* Owner Name */}
                {property.owner_name && (
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-yellow-400 text-xs">👤</span>
                    <span className="text-white/80 text-xs truncate">{property.owner_name}</span>
                  </div>
                )}

                {/* Property Details - Compact Grid */}
                <div className="grid grid-cols-2 gap-1.5 text-xs mb-3">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-blue-400 text-xs">📍</span>
                    <span className="text-white/80 truncate">{property.area || 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-purple-400 text-xs">📐</span>
                    <span className="text-white/80 truncate">{property.size || 'N/A'}</span>
                  </div>

                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-orange-400 text-xs">🛋️</span>
                    <span className="text-white/80 truncate">{property.furnishing_status || 'N/A'}</span>
                  </div>

                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-green-400 text-xs">✅</span>
                    <span className="text-white/80 truncate">{property.availability || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Section - Price and Contact */}
              <div className="border-t border-white/10 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-green-400">
                      {property.rent_or_sell_price ? `₹${parseFloat(property.rent_or_sell_price).toLocaleString()}` : 'N/A'}
                    </div>
                    <div className="text-xs text-white/60">
                      {property.property_type?.includes('rental') ? 'Per Month' : 'Total'}
                    </div>
                  </div>
                  
                  {/* Contact - Right Aligned */}
                  <div className="ml-2">
                    <ContactField
                      contact={property.owner_contact}
                      propertyId={String(property.serial_number || index)}
                      isVisible={isContactVisible(String(property.serial_number || index))}
                      onToggle={toggleContactVisibility}
                      className="text-xs flex items-center gap-1"
                      iconClassName=""
                      showIcon={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GalleryView;
