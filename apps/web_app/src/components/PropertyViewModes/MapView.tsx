"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { PropertyData } from '@/lib/dummyProperties';
import ContactField from '@/components/ui/ContactField';
import GoogleMapWrapper from '@/components/GoogleMapWrapper';

interface MapViewProps {
  properties: PropertyData[];
  loading: boolean;
  toggleContactVisibility: (propertyId: string) => void;
  isContactVisible: (propertyId: string) => boolean;
  getVisibleContactsCount: () => number;
}

interface PropertyWithCoords extends PropertyData {
  latitude?: number;
  longitude?: number;
  geocoded?: boolean;
}

// Geocoding service to convert area + address to coordinates
const geocodeAddress = async (area: string, address: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    const query = `${area} ${address}`.trim();
    if (!query) return null;

    // Using a geocoding service (you'll need to replace with your preferred service)
    // For now, we'll use a placeholder implementation
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${process.env.NEXT_PUBLIC_OPENCAGE_API_KEY}&limit=1`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        lat: result.geometry.lat,
        lng: result.geometry.lng
      };
    }
    
    return null;
  } catch (error) {
    console.warn('Geocoding failed for:', area, address, error);
    return null;
  }
};

// Fallback coordinates for different areas (you can expand this based on your data)
const fallbackCoordinates: { [key: string]: { lat: number; lng: number } } = {
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'delhi': { lat: 28.6139, lng: 77.2090 },
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'pune': { lat: 18.5204, lng: 73.8567 },
  'hyderabad': { lat: 17.3850, lng: 78.4867 },
  'chennai': { lat: 13.0827, lng: 80.2707 },
  'kolkata': { lat: 22.5726, lng: 88.3639 },
  'ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'jaipur': { lat: 26.9124, lng: 75.7873 },
  'surat': { lat: 21.1702, lng: 72.8311 },
};

const getFallbackCoordinates = (area: string): { lat: number; lng: number } | null => {
  const normalizedArea = area.toLowerCase().trim();
  
  // Direct match
  if (fallbackCoordinates[normalizedArea]) {
    return fallbackCoordinates[normalizedArea];
  }
  
  // Partial match
  for (const [key, coords] of Object.entries(fallbackCoordinates)) {
    if (normalizedArea.includes(key) || key.includes(normalizedArea)) {
      return coords;
    }
  }
  
  return null;
};

const MapView: React.FC<MapViewProps> = ({
  properties,
  loading,
  toggleContactVisibility,
  isContactVisible
}) => {
  const [propertiesWithCoords, setPropertiesWithCoords] = useState<PropertyWithCoords[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: 19.0760, lng: 72.8777 }); // Default to Mumbai
  const [selectedProperty, setSelectedProperty] = useState<PropertyWithCoords | null>(null);
  const [geocodingProgress, setGeocodingProgress] = useState({ current: 0, total: 0 });
  const [showApiKeyWarning, setShowApiKeyWarning] = useState(false);

  // Geocode properties
  useEffect(() => {
    const geocodeProperties = async () => {
      if (!properties.length) {
        setPropertiesWithCoords([]);
        return;
      }

      setGeocodingProgress({ current: 0, total: properties.length });
      const geocodedProperties: PropertyWithCoords[] = [];

      for (let i = 0; i < properties.length; i++) {
        const property = properties[i];
        setGeocodingProgress({ current: i + 1, total: properties.length });

        let coords: { lat: number; lng: number } | null = null;

        // Try geocoding if API key is available
        if (process.env.NEXT_PUBLIC_OPENCAGE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
          coords = await geocodeAddress(property.area || '', property.address || '');
        } else {
          setShowApiKeyWarning(true);
        }

        // Fallback to area-based coordinates
        if (!coords && property.area) {
          coords = getFallbackCoordinates(property.area);
        }

        // Add some random offset to avoid overlapping markers for same area
        if (coords) {
          coords.lat += (Math.random() - 0.5) * 0.01;
          coords.lng += (Math.random() - 0.5) * 0.01;
        }

        geocodedProperties.push({
          ...property,
          latitude: coords?.lat,
          longitude: coords?.lng,
          geocoded: !!coords
        });
      }

      setPropertiesWithCoords(geocodedProperties);

      // Set map center to first property with coordinates
      const firstGeocoded = geocodedProperties.find(p => p.latitude && p.longitude);
      if (firstGeocoded && firstGeocoded.latitude && firstGeocoded.longitude) {
        setMapCenter({ lat: firstGeocoded.latitude, lng: firstGeocoded.longitude });
      }
    };

    geocodeProperties();
  }, [properties]);

  const handlePropertyClick = useCallback((property: PropertyWithCoords) => {
    setSelectedProperty(property);
    if (property.latitude && property.longitude) {
      setMapCenter({ lat: property.latitude, lng: property.longitude });
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-white/60">
        <div className="text-center">
          <div className="w-8 h-8 border border-white/40 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading properties...</p>
        </div>
      </div>
    );
  }

  if (!properties.length) {
    return (
      <div className="text-center py-8 text-white/60">
        No properties found matching your criteria
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* API Key Warning */}
      {showApiKeyWarning && (
        <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-200">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="font-medium">Limited Location Data</p>
              <p className="text-sm text-yellow-300/80">
                Add NEXT_PUBLIC_OPENCAGE_API_KEY or NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file for precise coordinates.
                Currently showing approximate locations based on area names.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Geocoding Progress */}
      {geocodingProgress.current < geocodingProgress.total && (
        <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-200">
            <div className="w-4 h-4 border border-white/40 border-t-white rounded-full animate-spin"></div>
            <span>Processing locations... {geocodingProgress.current}/{geocodingProgress.total}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
        {/* Map Container */}
        <div className="lg:col-span-2">
          <div className="h-full bg-white/10 border border-white/20 rounded-lg overflow-hidden">
            {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
              <GoogleMapWrapper
                properties={propertiesWithCoords}
                selectedProperty={selectedProperty}
                onPropertySelect={handlePropertyClick}
                center={mapCenter}
              />
            ) : (
              /* Placeholder for actual map implementation */
              <div className="h-full flex items-center justify-center text-white/60 relative">
                <div className="text-center">
                  <div className="text-4xl mb-4">🗺️</div>
                  <p className="text-lg font-medium mb-2">Interactive Map View</p>
                  <p className="text-sm text-white/80 mb-4">
                    {propertiesWithCoords.filter(p => p.geocoded).length} of {propertiesWithCoords.length} properties located
                  </p>
                  <div className="bg-white/10 rounded-lg p-4 max-w-md">
                    <p className="text-xs text-white/70 mb-2">To enable the interactive map:</p>
                    <ol className="text-xs text-white/80 text-left space-y-1">
                      <li>1. Get Google Maps API key from Google Cloud Console</li>
                      <li>2. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local</li>
                      <li>3. Install @googlemaps/react-wrapper package</li>
                    </ol>
                    <p className="text-xs text-white/60 mt-2">
                      Map Center: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
                    </p>
                  </div>
                </div>

                {/* Simple dots representation */}
                <div className="absolute inset-4 pointer-events-none">
                  {propertiesWithCoords.slice(0, 20).map((property, index) => (
                    property.geocoded && (
                      <div
                        key={property.serial_number || index}
                        className="absolute w-3 h-3 bg-red-500 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-150 transition-transform"
                        style={{
                          left: `${20 + (index % 8) * 10}%`,
                          top: `${20 + Math.floor(index / 8) * 15}%`
                        }}
                        onClick={() => handlePropertyClick(property)}
                        title={`${property.area} - ₹${property.rent_or_sell_price || 'N/A'}`}
                      />
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Property Cards Sidebar */}
        <div className="lg:col-span-1">
          <div className="h-full bg-white/10 border border-white/20 rounded-lg overflow-hidden">
            <div className="p-4 bg-white/10 border-b border-white/20">
              <h3 className="font-semibold text-white">Properties ({propertiesWithCoords.length})</h3>
              <p className="text-xs text-white/70">
                {propertiesWithCoords.filter(p => p.geocoded).length} mapped • {propertiesWithCoords.filter(p => !p.geocoded).length} unmapped
              </p>
            </div>
            <div className="h-full overflow-y-auto p-2 space-y-2" style={{ maxHeight: 'calc(100% - 80px)' }}>
              {propertiesWithCoords.map((property, index) => (
                <div
                  key={property.serial_number || index}
                  className={`card-hover-3d backdrop-blur-sm bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-lg p-3 cursor-pointer transition-all duration-300 ${
                    selectedProperty?.serial_number === property.serial_number 
                      ? 'border-blue-400/60 bg-blue-500/20' 
                      : 'hover:border-blue-400/40'
                  } ${!property.geocoded ? 'opacity-60' : ''}`}
                  onClick={() => handlePropertyClick(property)}
                >
                  {/* Property Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {property.property_type?.includes('Res') ? '🏠' : '🏢'}
                      </span>
                      <div>
                        <h4 className="text-sm font-medium text-white line-clamp-1">
                          {property.sub_property_type || property.property_type || 'Property'}
                        </h4>
                        <span className="text-xs text-white/60">#{property.serial_number}</span>
                      </div>
                    </div>
                    {!property.geocoded && (
                      <span className="text-xs text-orange-400" title="Location not mapped">📍?</span>
                    )}
                  </div>

                  {/* Property Details */}
                  <div className="space-y-1 text-xs">
                    {property.owner_name && (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">👤</span>
                        <span className="text-white/80 truncate">{property.owner_name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <span className="text-blue-400">📍</span>
                      <span className="text-white/80 truncate">{property.area || 'N/A'}</span>
                    </div>

                    {property.size && (
                      <div className="flex items-center gap-1">
                        <span className="text-purple-400">📐</span>
                        <span className="text-white/80">{property.size}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <span className="text-orange-400">🛋️</span>
                      <span className="text-white/80">{property.furnishing_status || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Price and Contact */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
                    <div>
                      <div className="text-sm font-bold text-green-400">
                        {property.rent_or_sell_price ? `₹${parseFloat(property.rent_or_sell_price).toLocaleString()}` : 'N/A'}
                      </div>
                      <div className="text-xs text-white/60">
                        {property.property_type?.includes('rental') ? 'Per Month' : 'Total'}
                      </div>
                    </div>
                    
                    <ContactField
                      contact={property.owner_contact}
                      propertyId={String(property.serial_number || index)}
                      isVisible={isContactVisible(String(property.serial_number || index))}
                      onToggle={toggleContactVisibility}
                      className="text-xs"
                      showIcon={true}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
