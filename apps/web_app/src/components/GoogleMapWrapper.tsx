/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { PropertyData } from '@/lib/dummyProperties';

interface GoogleMapProps {
  center: { lat: number; lng: number };
  zoom: number;
  properties: Array<PropertyData & { latitude?: number; longitude?: number }>;
  selectedProperty: (PropertyData & { latitude?: number; longitude?: number }) | null;
  onPropertySelect: (property: PropertyData & { latitude?: number; longitude?: number }) => void;
}

const GoogleMapComponent: React.FC<GoogleMapProps> = ({
  center,
  zoom,
  properties,
  selectedProperty,
  onPropertySelect
}) => {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = React.useState<any>(null);
  const markersRef = React.useRef<any[]>([]);
  const [infoWindow, setInfoWindow] = React.useState<any>(null);
  const onPropertySelectRef = React.useRef(onPropertySelect);

  // Keep ref up to date
  React.useEffect(() => {
    onPropertySelectRef.current = onPropertySelect;
  }, [onPropertySelect]);

  // Initialize map
  React.useEffect(() => {
    if (mapRef.current && !map && (window as any).google) {
      const newMap = new (window as any).google.maps.Map(mapRef.current, {
        center,
        zoom,
        styles: [
          {
            featureType: 'all',
            elementType: 'geometry',
            stylers: [{ color: '#242f3e' }]
          },
          {
            featureType: 'all',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#242f3e' }]
          },
          {
            featureType: 'all',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#746855' }]
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#17263c' }]
          }
        ]
      });
      setMap(newMap);
      
      const newInfoWindow = new (window as any).google.maps.InfoWindow();
      setInfoWindow(newInfoWindow);
    }
  }, [mapRef, map, center, zoom]);

  // Update map center when it changes
  React.useEffect(() => {
    if (map) {
      map.setCenter(center);
    }
  }, [map, center]);

  // Create markers for properties
  React.useEffect(() => {
    if (!map || !infoWindow || !(window as any).google) return;

    // Clear existing markers
    markersRef.current.forEach((marker: any) => marker.setMap(null));

    const newMarkers = properties
      .filter(property => property.latitude && property.longitude)
      .map(property => {
        const marker = new (window as any).google.maps.Marker({
          position: { lat: property.latitude!, lng: property.longitude! },
          map,
          title: `${property.area} - ₹${property.rent_or_sell_price || 'N/A'}`,
          icon: {
            url: property.property_type?.includes('Res') 
              ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMjIgMTJIMTlWMjBIMTVWMTRIOVYyMEg1VjEySDJMMTIgMloiIGZpbGw9IiM0Rjc5QTQiLz4KPHN2Zz4K'
              : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgM0gyMVYyMUgzVjNaTTUgNVYxOUgxOVY1SDVaTTcgN0gxN1Y5SDdWN1pNNyAxMUgxN1YxM0g3VjExWk03IDE1SDE3VjE3SDdWMTVaIiBmaWxsPSIjRjU5RTBCIi8+Cjwvc3ZnPgo=',
            scaledSize: new (window as any).google.maps.Size(30, 30),
            anchor: new (window as any).google.maps.Point(15, 30)
          }
        });

        // Create info window content
        const createInfoWindowContent = (prop: PropertyData) => `
          <div style="max-width: 250px; font-family: system-ui, sans-serif;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 20px;">${prop.property_type?.includes('Res') ? '🏠' : '🏢'}</span>
              <div>
                <h3 style="margin: 0; font-size: 14px; font-weight: 600; color: #1f2937;">
                  ${prop.sub_property_type || prop.property_type || 'Property'}
                </h3>
                <span style="font-size: 12px; color: #6b7280;">#${prop.serial_number}</span>
              </div>
            </div>
            
            <div style="margin-bottom: 8px;">
              ${prop.owner_name ? `
                <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
                  <span>👤</span>
                  <span style="font-size: 12px; color: #374151;">${prop.owner_name}</span>
                </div>
              ` : ''}
              
              <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
                <span>📍</span>
                <span style="font-size: 12px; color: #374151;">${prop.area || 'N/A'}</span>
              </div>
              
              ${prop.size ? `
                <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
                  <span>📐</span>
                  <span style="font-size: 12px; color: #374151;">${prop.size}</span>
                </div>
              ` : ''}
              
              <div style="display: flex; align-items: center; gap: 4px;">
                <span>🛋️</span>
                <span style="font-size: 12px; color: #374151;">${prop.furnishing_status || 'N/A'}</span>
              </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid #e5e7eb;">
              <div>
                <div style="font-size: 14px; font-weight: 600; color: #059669;">
                  ${prop.rent_or_sell_price ? `₹${parseFloat(prop.rent_or_sell_price).toLocaleString()}` : 'N/A'}
                </div>
                <div style="font-size: 10px; color: #6b7280;">
                  ${prop.property_type?.includes('rental') ? 'Per Month' : 'Total'}
                </div>
              </div>
              <span style="font-size: 12px; padding: 2px 6px; background-color: #dbeafe; color: #1e40af; border-radius: 4px;">
                ${prop.availability || 'N/A'}
              </span>
            </div>
          </div>
        `;

        marker.addListener('click', () => {
          infoWindow.setContent(createInfoWindowContent(property));
          infoWindow.open(map, marker);
          onPropertySelectRef.current(property);
        });

        return marker;
      });

    markersRef.current = newMarkers;
    
    // Cleanup function
    return () => {
      markersRef.current.forEach((marker: any) => marker.setMap(null));
    };
  }, [map, properties, infoWindow]);

  // Highlight selected property
  React.useEffect(() => {
    if (selectedProperty && map && infoWindow && markersRef.current.length > 0) {
      const selectedMarker = markersRef.current.find((marker: any) => {
        const position = marker.getPosition();
        return position?.lat() === selectedProperty.latitude && 
               position?.lng() === selectedProperty.longitude;
      });

      if (selectedMarker) {
        map.setCenter({ lat: selectedProperty.latitude!, lng: selectedProperty.longitude! });
        map.setZoom(Math.max(map.getZoom() || 12, 15));
        
        const createInfoWindowContent = (prop: PropertyData) => `
          <div style="max-width: 250px; font-family: system-ui, sans-serif;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 20px;">${prop.property_type?.includes('Res') ? '🏠' : '🏢'}</span>
              <div>
                <h3 style="margin: 0; font-size: 14px; font-weight: 600; color: #1f2937;">
                  ${prop.sub_property_type || prop.property_type || 'Property'}
                </h3>
                <span style="font-size: 12px; color: #6b7280;">#${prop.serial_number}</span>
              </div>
            </div>
            
            <div style="margin-bottom: 8px;">
              ${prop.owner_name ? `
                <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
                  <span>👤</span>
                  <span style="font-size: 12px; color: #374151;">${prop.owner_name}</span>
                </div>
              ` : ''}
              
              <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
                <span>📍</span>
                <span style="font-size: 12px; color: #374151;">${prop.area || 'N/A'}</span>
              </div>
              
              ${prop.size ? `
                <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
                  <span>📐</span>
                  <span style="font-size: 12px; color: #374151;">${prop.size}</span>
                </div>
              ` : ''}
              
              <div style="display: flex; align-items: center; gap: 4px;">
                <span>🛋️</span>
                <span style="font-size: 12px; color: #374151;">${prop.furnishing_status || 'N/A'}</span>
              </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid #e5e7eb;">
              <div>
                <div style="font-size: 14px; font-weight: 600; color: #059669;">
                  ${prop.rent_or_sell_price ? `₹${parseFloat(prop.rent_or_sell_price).toLocaleString()}` : 'N/A'}
                </div>
                <div style="font-size: 10px; color: #6b7280;">
                  ${prop.property_type?.includes('rental') ? 'Per Month' : 'Total'}
                </div>
              </div>
              <span style="font-size: 12px; padding: 2px 6px; background-color: #dbeafe; color: #1e40af; border-radius: 4px;">
                ${prop.availability || 'N/A'}
              </span>
            </div>
          </div>
        `;
        
        infoWindow.setContent(createInfoWindowContent(selectedProperty));
        infoWindow.open(map, selectedMarker);
      }
    }
  }, [selectedProperty, map, infoWindow]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

interface GoogleMapWrapperProps {
  properties: Array<PropertyData & { latitude?: number; longitude?: number }>;
  selectedProperty: (PropertyData & { latitude?: number; longitude?: number }) | null;
  onPropertySelect: (property: PropertyData & { latitude?: number; longitude?: number }) => void;
  center: { lat: number; lng: number };
}

const GoogleMapWrapper: React.FC<GoogleMapWrapperProps> = (props) => {
  const render = (status: Status) => {
    switch (status) {
      case Status.LOADING:
        return (
          <div className="h-full flex items-center justify-center bg-white/10 rounded-lg">
            <div className="text-center text-white/60">
              <div className="w-8 h-8 border border-white/40 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
              <p>Loading Google Maps...</p>
            </div>
          </div>
        );
      case Status.FAILURE:
        return (
          <div className="h-full flex items-center justify-center bg-red-500/20 border border-red-400/30 rounded-lg">
            <div className="text-center text-red-200">
              <span className="text-2xl mb-2 block">❌</span>
              <p className="font-medium">Google Maps Failed to Load</p>
              <p className="text-sm text-red-300/80 mt-1">
                Please check your API key configuration
              </p>
            </div>
          </div>
        );
      case Status.SUCCESS:
        return <GoogleMapComponent {...props} zoom={12} />;
    }
  };

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="h-full flex items-center justify-center bg-white/10 border border-white/20 rounded-lg">
        <div className="text-center text-white/60">
          <div className="text-4xl mb-4">🗺️</div>
          <p className="text-lg font-medium mb-2">Google Maps Not Configured</p>
          <p className="text-sm text-white/80 mb-4">
            Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file
          </p>
          <div className="bg-white/10 rounded-lg p-4 max-w-md">
            <p className="text-xs text-white/70 mb-2">Setup Instructions:</p>
            <ol className="text-xs text-white/80 text-left space-y-1">
              <li>1. Go to Google Cloud Console</li>
              <li>2. Enable Maps JavaScript API</li>
              <li>3. Create API key</li>
              <li>4. Add to .env.local file</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Wrapper apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} render={render} />
  );
};

export default GoogleMapWrapper;
