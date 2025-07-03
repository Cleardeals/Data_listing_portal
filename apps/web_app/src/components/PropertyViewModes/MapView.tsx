"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { PropertyData } from '@/lib/dummyProperties';
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

    // Try Google Maps Geocoding API first if available
    if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const location = data.results[0].geometry.location;
          return {
            lat: location.lat,
            lng: location.lng
          };
        }
      }
    }

    // Fallback to OpenCage API if Google Maps fails
    if (process.env.NEXT_PUBLIC_OPENCAGE_API_KEY) {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${process.env.NEXT_PUBLIC_OPENCAGE_API_KEY}&limit=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const result = data.results[0];
          return {
            lat: result.geometry.lat,
            lng: result.geometry.lng
          };
        }
      }
    }
    
    return null;
  } catch (error) {
    console.warn('Geocoding failed for:', area, address, error);
    return null;
  }
};



const MapView: React.FC<MapViewProps> = ({
  properties,
  loading
}) => {
  console.log('MapView: Starting with', properties.length, 'properties');

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

        // Try geocoding with area and address
        if (property.area || property.address) {
          coords = await geocodeAddress(property.area || '', property.address || '');
          
          if (!coords && !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && !process.env.NEXT_PUBLIC_OPENCAGE_API_KEY) {
            setShowApiKeyWarning(true);
          }
        }

        // Only add properties that have valid coordinates
        if (coords) {
          geocodedProperties.push({
            ...property,
            latitude: coords.lat,
            longitude: coords.lng,
            geocoded: true
          });
        }
      }

      setPropertiesWithCoords(geocodedProperties);
      
      console.log('MapView: Geocoding complete:', {
        total: properties.length,
        successfully_geocoded: geocodedProperties.length
      });

      // Set map center to first geocoded property or calculate center of all properties
      if (geocodedProperties.length > 0) {
        if (geocodedProperties.length === 1) {
          const property = geocodedProperties[0];
          setMapCenter({ lat: property.latitude!, lng: property.longitude! });
        } else {
          // Calculate center of all properties
          const avgLat = geocodedProperties.reduce((sum, p) => sum + p.latitude!, 0) / geocodedProperties.length;
          const avgLng = geocodedProperties.reduce((sum, p) => sum + p.longitude!, 0) / geocodedProperties.length;
          setMapCenter({ lat: avgLat, lng: avgLng });
        }
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
              <p className="font-medium">Geocoding API Key Required</p>
              <p className="text-sm text-yellow-300/80">
                Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY or NEXT_PUBLIC_OPENCAGE_API_KEY to your .env file to plot properties on the map.
                Without an API key, properties cannot be geocoded and mapped.
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
            <span>Geocoding locations... {geocodingProgress.current}/{geocodingProgress.total}</span>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="bg-white/10 border border-white/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-white">
              <span className="text-lg font-bold text-green-400">{propertiesWithCoords.length}</span>
              <span className="text-sm text-white/70 ml-1">properties plotted</span>
            </div>
            <div className="text-white">
              <span className="text-lg font-bold text-orange-400">{properties.length - propertiesWithCoords.length}</span>
              <span className="text-sm text-white/70 ml-1">failed to geocode</span>
            </div>
          </div>
          <div className="text-xs text-white/60">
            🗺️ Interactive map view with hover cards
          </div>
        </div>
      </div>

      {/* Full Width Map Container */}
      <div className="w-full h-[700px]">
        <div className="h-full w-full bg-white/10 border border-white/20 rounded-lg overflow-hidden">
          {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
            <div className="h-full w-full">
              <GoogleMapWrapper
                properties={propertiesWithCoords}
                selectedProperty={selectedProperty}
                onPropertySelect={handlePropertyClick}
                center={mapCenter}
              />
            </div>
          ) : (
            /* Placeholder when no API key */
            <div className="h-full flex items-center justify-center text-white/60">
              <div className="text-center">
                <div className="text-4xl mb-4">🗺️</div>
                <p className="text-lg font-medium mb-2">Interactive Map View</p>
                <p className="text-sm text-white/80 mb-4">
                  {propertiesWithCoords.length} of {properties.length} properties ready to plot
                </p>
                <div className="bg-white/10 rounded-lg p-4 max-w-md">
                  <p className="text-xs text-white/70 mb-2">To enable the interactive map:</p>
                  <ol className="text-xs text-white/80 text-left space-y-1">
                    <li>1. Get Google Maps API key from Google Cloud Console</li>
                    <li>2. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env</li>
                    <li>3. Restart the development server</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {propertiesWithCoords.length === 0 && properties.length > 0 && (
        <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-200">
            <span className="text-lg">🚫</span>
            <div>
              <p className="font-medium">No Properties Mapped</p>
              <p className="text-sm text-red-300/80">
                None of the {properties.length} properties could be geocoded. Please check that properties have valid area/address information and that geocoding API keys are configured.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
