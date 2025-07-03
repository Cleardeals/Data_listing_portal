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
  console.log('GoogleMapComponent: Rendering with', {
    center,
    zoom,
    propertiesCount: properties.length,
    googleMapsAvailable: !!(window as any).google
  });

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
    console.log('GoogleMapComponent: Map initialization', {
      hasMapRef: !!mapRef.current,
      hasMap: !!map,
      hasGoogle: !!(window as any).google
    });

    if (mapRef.current && !map && (window as any).google) {
      console.log('GoogleMapComponent: Creating new map instance');
      try {
        const mapOptions = {
          center,
          zoom,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        };
        
        const newMap = new (window as any).google.maps.Map(mapRef.current, mapOptions);
        console.log('GoogleMapComponent: Map instance created:', newMap);
        
        setMap(newMap);
        console.log('GoogleMapComponent: Map created successfully');
        
        const newInfoWindow = new (window as any).google.maps.InfoWindow();
        setInfoWindow(newInfoWindow);
        console.log('GoogleMapComponent: InfoWindow created successfully');
        
      } catch (error) {
        console.error('GoogleMapComponent: Error creating map:', error);
      }
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

    console.log('Creating markers for', properties.length, 'properties');

    // Clear existing markers
    markersRef.current.forEach((marker: any) => marker.setMap(null));
    markersRef.current = [];

    const validProperties = properties.filter(property => {
      const isValid = property.latitude && property.longitude && 
                     !isNaN(property.latitude) && !isNaN(property.longitude);
      if (!isValid) {
        console.warn('Invalid property coordinates:', property.area, property.latitude, property.longitude);
      }
      return isValid;
    });

    console.log('Valid properties for mapping:', validProperties.length);

    const newMarkers = validProperties.map(property => {
      console.log('Creating marker for:', property.area, property.latitude, property.longitude);
      
      const marker = new (window as any).google.maps.Marker({
        position: { lat: property.latitude!, lng: property.longitude! },
        map,
        title: `${property.area} - ₹${property.rent_or_sell_price || 'N/A'}`,
        icon: {
          path: (window as any).google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: property.property_type?.includes('Res') ? '#4F79A4' : '#F59E0B',
          fillOpacity: 0.8,
          strokeColor: '#FFFFFF',
          strokeWeight: 2
        }
      });

        // Create info window content
        const createInfoWindowContent = (prop: PropertyData) => `
          <div style="max-width: 300px; font-family: system-ui, sans-serif;">
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
              
              ${prop.address ? `
                <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
                  <span>🏠</span>
                  <span style="font-size: 12px; color: #374151;">${prop.address}</span>
                </div>
              ` : ''}
              
              ${prop.size ? `
                <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
                  <span>📐</span>
                  <span style="font-size: 12px; color: #374151;">${prop.size}</span>
                </div>
              ` : ''}
              
              <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
                <span>🛋️</span>
                <span style="font-size: 12px; color: #374151;">${prop.furnishing_status || 'N/A'}</span>
              </div>

              ${prop.owner_contact ? `
                <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
                  <span>📞</span>
                  <span style="font-size: 12px; color: #059669; font-weight: 600;">${prop.owner_contact}</span>
                </div>
              ` : ''}
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

        marker.addListener('mouseover', () => {
          infoWindow.setContent(createInfoWindowContent(property));
          infoWindow.open(map, marker);
        });

        marker.addListener('mouseout', () => {
          // Close info window after a short delay to allow for mouse movement to info window
          setTimeout(() => {
            if (!marker.get('isHovered')) {
              infoWindow.close();
            }
          }, 200);
        });

        marker.addListener('click', () => {
          // Keep info window open on click and select property
          infoWindow.setContent(createInfoWindowContent(property));
          infoWindow.open(map, marker);
          onPropertySelectRef.current(property);
        });

        // Track hover state
        marker.set('isHovered', false);

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

  return (
    <div 
      ref={mapRef} 
      style={{ 
        width: '100%', 
        height: '100%'
      }} 
      className="google-map-container"
    />
  );
};

interface GoogleMapWrapperProps {
  properties: Array<PropertyData & { latitude?: number; longitude?: number }>;
  selectedProperty: (PropertyData & { latitude?: number; longitude?: number }) | null;
  onPropertySelect: (property: PropertyData & { latitude?: number; longitude?: number }) => void;
  center: { lat: number; lng: number };
}

const GoogleMapWrapper: React.FC<GoogleMapWrapperProps> = (props) => {
  console.log('GoogleMapWrapper: Rendering with props', {
    propertiesCount: props.properties.length,
    hasApiKey: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    center: props.center,
    apiKeyPrefix: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.substring(0, 15)
  });

  const render = (status: Status) => {
    console.log('GoogleMapWrapper: Render status:', status);
    
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
        console.error('GoogleMapWrapper: Google Maps failed to load');
        return (
          <div className="h-full flex items-center justify-center bg-red-500/20 border border-red-400/30 rounded-lg">
            <div className="text-center text-red-200">
              <span className="text-2xl mb-2 block">❌</span>
              <p className="font-medium">Google Maps Failed to Load</p>
              <p className="text-sm text-red-300/80 mt-1">
                Check console for details. Verify API key and enabled services.
              </p>
            </div>
          </div>
        );
      case Status.SUCCESS:
        console.log('GoogleMapWrapper: Google Maps loaded successfully, rendering GoogleMapComponent');
        return <GoogleMapComponent {...props} zoom={12} />;
      default:
        console.warn('GoogleMapWrapper: Unknown status:', status);
        return (
          <div className="h-full flex items-center justify-center bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
            <div className="text-center text-yellow-200">
              <span className="text-2xl mb-2 block">⚠️</span>
              <p>Unknown Google Maps status: {status}</p>
            </div>
          </div>
        );
    }
  };

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    console.log('GoogleMapWrapper: No Google Maps API key found');
    return (
      <div className="h-full flex items-center justify-center bg-white/10 border border-white/20 rounded-lg">
        <div className="text-center text-white/60">
          <div className="text-4xl mb-4">🗺️</div>
          <p className="text-lg font-medium mb-2">Google Maps Not Configured</p>
          <p className="text-sm text-white/80 mb-4">
            Google Maps API key not found in environment variables
          </p>
          <div className="bg-white/10 rounded-lg p-4 max-w-md">
            <p className="text-xs text-white/70 mb-2">Current environment check:</p>
            <div className="text-xs text-white/80 text-left space-y-1">
              <div>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'Found' : 'Not found'}</div>
            </div>
          </div>
          <div className="mt-4 text-xs text-white/60">
            <p>📌 {props.properties.length} properties ready to map</p>
            <p>🎯 Center: {props.center.lat.toFixed(4)}, {props.center.lng.toFixed(4)}</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('GoogleMapWrapper: Using API key, rendering Wrapper component');
  return (
    <Wrapper 
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} 
      render={render}
      libraries={['geometry', 'places']}
    />
  );
};

export default GoogleMapWrapper;
