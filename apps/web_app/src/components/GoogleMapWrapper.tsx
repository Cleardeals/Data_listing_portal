/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { PropertyData } from '@/lib/dummyProperties';
import ContactField from '@/components/ui/ContactField';

interface GoogleMapProps {
  center: { lat: number; lng: number };
  zoom: number;
  properties: Array<PropertyData & { latitude?: number; longitude?: number }>;
  selectedProperty: (PropertyData & { latitude?: number; longitude?: number }) | null;
  onPropertySelect: (property: PropertyData & { latitude?: number; longitude?: number }) => void;
  toggleContactVisibility: (propertyId: string) => void;
  isContactVisible: (propertyId: string) => boolean;
}

function GoogleMapComponent({
  center,
  zoom,
  properties,
  selectedProperty,
  onPropertySelect,
  toggleContactVisibility,
  isContactVisible
}: GoogleMapProps) {
  console.log('GoogleMapComponent: Rendering with', {
    center,
    zoom,
    propertiesCount: properties.length,
    googleMapsAvailable: !!(window as any).google
  });

  const mapRef = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = React.useState<any>(null);
  const markersRef = React.useRef<any[]>([]);
  const [hoveredProperty, setHoveredProperty] = React.useState<(PropertyData & { latitude?: number; longitude?: number }) | null>(null);
  const [hoverCardPosition, setHoverCardPosition] = React.useState<{ x: number; y: number } | null>(null);
  const [isHoveringCard, setIsHoveringCard] = React.useState(false);
  const onPropertySelectRef = React.useRef(onPropertySelect);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

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
        
      } catch (error) {
        console.error('GoogleMapComponent: Error creating map:', error);
      }
    }
  }, [mapRef, map, center, zoom]);

  // Update map center when it changes, but maintain Pune focus
  React.useEffect(() => {
    if (map) {
      // Always keep the map centered on Pune area regardless of prop changes
      const puneCenter = { lat: 18.5204, lng: 73.8567 };
      
      // Only update center if the current center is significantly far from Pune
      const currentCenter = map.getCenter();
      if (currentCenter) {
        const currentLat = currentCenter.lat();
        const currentLng = currentCenter.lng();
        
        // Check if current center is outside Pune area
        const isOutsidePune = currentLat < 18.3 || currentLat > 18.8 || 
                             currentLng < 73.6 || currentLng > 74.1;
        
        if (isOutsidePune) {
          console.log('Map moved outside Pune area, resetting to Pune center');
          map.setCenter(puneCenter);
          map.setZoom(12);
        }
      } else {
        // If no current center, set to Pune
        map.setCenter(puneCenter);
      }
    }
  }, [map, center]);

  // Clear hover card when no longer hovering
  const clearHoverCard = React.useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      if (!isHoveringCard) {
        setHoveredProperty(null);
        setHoverCardPosition(null);
      }
    }, 200);
  }, [isHoveringCard]);

  // Array of bright colors that contrast well with green map background - moved outside to prevent recreation
  const brightColors = React.useMemo(() => [
    '#FF1744', // Bright red
    '#FF6D00', // Bright orange
    '#2962FF', // Bright blue
    '#E91E63', // Bright pink
    '#9C27B0', // Bright purple
    '#FF5722', // Bright red-orange
    '#3F51B5', // Bright indigo
    '#FF9800', // Bright amber
    '#E53935', // Bright red variant
    '#8E24AA', // Bright purple variant
    '#1E88E5', // Bright blue variant
    '#FB8C00', // Bright orange variant
    '#D81B60', // Bright pink variant
    '#5E35B1', // Bright deep purple
    '#1976D2'  // Bright blue variant
  ], []);

  // Function to get consistent color for a property
  const getPropertyColor = React.useCallback((property: PropertyData & { latitude?: number; longitude?: number }) => {
    // Create a simple hash from property's unique identifiers
    const identifier = `${property.serial_number}-${property.area}-${property.latitude}-${property.longitude}`;
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
      const char = identifier.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Use absolute value to ensure positive index
    const colorIndex = Math.abs(hash) % brightColors.length;
    return brightColors[colorIndex];
  }, [brightColors]);

  // Memoize valid properties to prevent unnecessary marker recreation
  const validProperties = React.useMemo(() => {
    return properties.filter(property => {
      const isValid = property.latitude && property.longitude && 
                     !isNaN(property.latitude) && !isNaN(property.longitude);
      if (!isValid) {
        console.warn('Invalid property coordinates:', property.area, property.latitude, property.longitude);
      }
      return isValid;
    });
  }, [properties]);

  // Create markers for properties
  React.useEffect(() => {
    if (!map || !(window as any).google) return;

    console.log('Creating markers for', validProperties.length, 'properties');

    // Clear existing markers
    markersRef.current.forEach((marker: any) => marker.setMap(null));
    markersRef.current = [];

    console.log('Valid properties for mapping:', validProperties.length);

    const newMarkers = validProperties.map(property => {
      console.log('Creating marker for:', property.area, property.latitude, property.longitude);
      
      // Get consistent color for this property
      const markerColor = getPropertyColor(property);
      
      const marker = new (window as any).google.maps.Marker({
        position: { lat: property.latitude!, lng: property.longitude! },
        map,
        title: `${property.area} - ₹${property.rent_or_sell_price || 'N/A'}`,
        icon: {
          path: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
          fillColor: markerColor,
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 3,
          strokeOpacity: 1,
          scale: 2,
          anchor: new (window as any).google.maps.Point(12, 20)
        },
        animation: (window as any).google.maps.Animation.DROP
      });

      // Store the original color and property reference on the marker to prevent flickering
      marker.originalColor = markerColor;
      marker.propertyId = property.serial_number;

      marker.addListener('mouseover', (event: any) => {
        // Use stored original color instead of regenerating
        marker.setIcon({
          path: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
          fillColor: marker.originalColor,
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 4,
          strokeOpacity: 1,
          scale: 2.5,
          anchor: new (window as any).google.maps.Point(12, 20)
        });
        
        // Call hover handler directly to avoid dependency issues
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
        }
        
        setHoveredProperty(property);
        
        // Use mouse event position for card placement
        if (mapRef.current && event && event.domEvent) {
          const mapContainer = mapRef.current;
          const rect = mapContainer.getBoundingClientRect();
          const clientX = event.domEvent.clientX;
          const clientY = event.domEvent.clientY;
          
          setHoverCardPosition({
            x: clientX - rect.left,
            y: clientY - rect.top - 45 // Adjusted offset for slightly larger card
          });
        }
      });

      marker.addListener('mouseout', () => {
        // Use stored original color instead of regenerating
        marker.setIcon({
          path: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
          fillColor: marker.originalColor,
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 3,
          strokeOpacity: 1,
          scale: 2,
          anchor: new (window as any).google.maps.Point(12, 20)
        });
        
        // Call leave handler directly to avoid dependency issues
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
        }
        hoverTimeoutRef.current = setTimeout(() => {
          // Check current hover state instead of using stale closure
          setHoveredProperty(prev => {
            setHoverCardPosition(prevPos => {
              // Only clear if we're not currently hovering on the card
              if (!document.querySelector('.hover-card:hover')) {
                return null;
              }
              return prevPos;
            });
            if (!document.querySelector('.hover-card:hover')) {
              return null;
            }
            return prev;
          });
        }, 200);
      });

      marker.addListener('click', () => {
        onPropertySelectRef.current(property);
      });

      return marker;
    });

    markersRef.current = newMarkers;
    
    // Always keep the map centered in Pune area, regardless of markers
    const puneCenter = { lat: 18.5204, lng: 73.8567 };
    
    if (newMarkers.length > 0) {
      // Validate that all markers are actually in the Pune area before fitting bounds
      const allMarkersInPune = newMarkers.every(marker => {
        const position = marker.getPosition();
        const lat = position.lat();
        const lng = position.lng();
        // Check if coordinates are within reasonable Pune bounds
        return lat >= 18.3 && lat <= 18.8 && lng >= 73.6 && lng <= 74.1;
      });
      
      if (allMarkersInPune) {
        // Only fit bounds if all markers are confirmed to be in Pune area
        const bounds = new (window as any).google.maps.LatLngBounds();
        newMarkers.forEach(marker => {
          bounds.extend(marker.getPosition());
        });
        
        // Fit bounds with padding to ensure we don't zoom in too much
        map.fitBounds(bounds, 50); // 50px padding
        
        // Ensure reasonable zoom levels
        (window as any).google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
          const currentZoom = map.getZoom();
          if (currentZoom > 14) {
            map.setZoom(14); // Max zoom level
          } else if (currentZoom < 11) {
            map.setZoom(11); // Min zoom level
          }
        });
      } else {
        // If any markers are outside Pune, just center on Pune with fixed zoom
        map.setCenter(puneCenter);
        map.setZoom(12);
      }
    } else {
      // If no markers, center on Pune with default zoom
      map.setCenter(puneCenter);
      map.setZoom(12);
    }
    
    // Cleanup function
    return () => {
      markersRef.current.forEach((marker: any) => marker.setMap(null));
    };
  }, [map, validProperties, getPropertyColor]);

  // Highlight selected property
  React.useEffect(() => {
    if (selectedProperty && map && markersRef.current.length > 0) {
      const selectedMarker = markersRef.current.find((marker: any) => {
        const position = marker.getPosition();
        return position?.lat() === selectedProperty.latitude && 
               position?.lng() === selectedProperty.longitude;
      });

      if (selectedMarker) {
        map.setCenter({ lat: selectedProperty.latitude!, lng: selectedProperty.longitude! });
        map.setZoom(Math.max(map.getZoom() || 12, 15));
      }
    }
  }, [selectedProperty, map]);

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '100%'
        }} 
        className="google-map-container"
      />
      
      {/* Custom Hover Card */}
      {hoveredProperty && hoverCardPosition && (
        <div
          className="absolute z-50 pointer-events-auto hover-card"
          style={{
            left: `${hoverCardPosition.x}px`,
            top: `${hoverCardPosition.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
          onMouseEnter={() => setIsHoveringCard(true)}
          onMouseLeave={() => {
            setIsHoveringCard(false);
            clearHoverCard();
          }}
        >
          <div className="backdrop-blur-md bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-white/30 rounded-lg overflow-hidden transition-all duration-300 shadow-2xl max-w-sm">
            <div className="flex flex-row h-36">
              {/* Image/Icon Section - Left Side */}
              <div className="w-16 h-full bg-gradient-to-br from-blue-600/80 to-purple-600/80 flex items-center justify-center border-r border-white/30 flex-shrink-0">
                <div className="text-center">
                  <div className="text-xl">
                    {hoveredProperty.property_type?.includes('Res') ? '🏠' : '🏢'}
                  </div>
                </div>
              </div>

              {/* Content Section - Right Side */}
              <div className="flex-1 p-2.5 flex flex-col justify-between min-w-0">
                {/* Top Section - Title and Serial */}
                <div>
                  <div className="flex items-start justify-between mb-1.5">
                    <h3 className="text-xs font-semibold text-white line-clamp-1 flex-1 mr-1.5">
                      {hoveredProperty.sub_property_type || hoveredProperty.property_type || 'Property'}
                    </h3>
                    <span className="text-[10px] text-white/60 bg-white/10 px-1.5 py-0.5 rounded text-nowrap">
                      #{hoveredProperty.serial_number}
                    </span>
                  </div>

                  {/* Owner Name */}
                  {hoveredProperty.owner_name && (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-yellow-400 text-[10px]">👤</span>
                      <span className="text-white/80 text-[10px] truncate">{hoveredProperty.owner_name}</span>
                    </div>
                  )}

                  {/* Property Details - Compact Grid */}
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-blue-400 text-[9px]">📍</span>
                      <span className="text-white/80 truncate">{hoveredProperty.area || 'N/A'}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-purple-400 text-[9px]">📐</span>
                      <span className="text-white/80 truncate">{hoveredProperty.size || 'N/A'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-orange-400 text-[9px]">🛋️</span>
                      <span className="text-white/80 truncate">{hoveredProperty.furnishing_status || 'N/A'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-blue-400 text-[9px]">ℹ️</span>
                      <span className="text-blue-400 text-[10px] font-medium truncate">
                        {hoveredProperty.availability || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Section - Price and Contact */}
                <div className="border-t border-white/10 pt-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-green-400">
                        {hoveredProperty.rent_or_sell_price ? `₹${parseFloat(hoveredProperty.rent_or_sell_price).toLocaleString()}` : 'N/A'}
                      </div>
                      <div className="text-[9px] text-white/60 mt-0.5">
                        {hoveredProperty.property_type?.includes('rental') ? 'Per Month' : 'Total'}
                      </div>
                    </div>
                    
                    {/* Contact - Right Aligned */}
                    <div className="ml-2.5">
                      <ContactField
                        contact={hoveredProperty.owner_contact}
                        propertyId={String(hoveredProperty.serial_number)}
                        isVisible={isContactVisible(String(hoveredProperty.serial_number))}
                        onToggle={toggleContactVisibility}
                        className="text-[10px] flex items-center gap-1"
                        iconClassName=""
                        showIcon={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface GoogleMapWrapperProps {
  properties: Array<PropertyData & { latitude?: number; longitude?: number }>;
  selectedProperty: (PropertyData & { latitude?: number; longitude?: number }) | null;
  onPropertySelect: (property: PropertyData & { latitude?: number; longitude?: number }) => void;
  center: { lat: number; lng: number };
  toggleContactVisibility: (propertyId: string) => void;
  isContactVisible: (propertyId: string) => boolean;
}

function GoogleMapWrapper(props: GoogleMapWrapperProps) {
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
