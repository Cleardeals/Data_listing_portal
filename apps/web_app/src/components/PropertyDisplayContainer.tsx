"use client";

import React from 'react';
import { PropertyData } from '@/lib/dummyProperties';
import { ViewMode } from './PropertyFiltersPanel';
import {
  CompactTableView,
  GalleryView,
  MasterTableView,
  MapView
} from './PropertyViewModes';

interface PropertyDisplayContainerProps {
  properties: PropertyData[];
  loading: boolean;
  totalCount: number;
  viewMode: ViewMode;
  toggleContactVisibility: (propertyId: string) => void;
  isContactVisible: (propertyId: string) => boolean;
  getVisibleContactsCount: () => number;
  onToggleRentSoldOut?: (serialNumber: number, rentSoldOut: boolean) => void;
  canEditRentSoldOut?: boolean;
}

const PropertyDisplayContainer: React.FC<PropertyDisplayContainerProps> = ({
  properties,
  loading,
  totalCount,
  viewMode,
  toggleContactVisibility,
  isContactVisible,
  getVisibleContactsCount,
  onToggleRentSoldOut,
  canEditRentSoldOut = false,
}) => {
  const getViewModeTitle = () => {
    switch (viewMode) {
      case 'compact': return '📊 Compact Table';
      case 'gallery': return '🖼️ Gallery View';
      case 'master': return '📜 Master View';
      case 'map': return '🗺️ Map View';
      default: return '📊 Compact Table';
    }
  };

  const renderContent = () => {
    const contactProps = {
      toggleContactVisibility,
      isContactVisible,
      getVisibleContactsCount,
    };

    switch (viewMode) {
      case 'compact':
        return <CompactTableView properties={properties} loading={loading} {...contactProps} />;
      case 'gallery':
        return <GalleryView properties={properties} loading={loading} {...contactProps} />;
      case 'map':
        return <MapView properties={properties} loading={loading} {...contactProps} />;
      case 'master':
        return (
          <MasterTableView 
            properties={properties} 
            loading={loading} 
            {...contactProps}
            onToggleRentSoldOut={onToggleRentSoldOut}
            canEditRentSoldOut={canEditRentSoldOut}
          />
        );
      default:
        return <CompactTableView properties={properties} loading={loading} {...contactProps} />;
    }
  };

  return (
    <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-2xl overflow-hidden">
      {/* View Mode Header */}
      <div className="bg-white/10 border-b border-white/20 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-white">
              {getViewModeTitle()}
            </h3>
            <div className="text-sm text-white/70">
              {properties.length.toLocaleString()} of {totalCount.toLocaleString()} properties
            </div>
            <div className="text-xs text-cyan-400 bg-cyan-500/20 px-2 py-1 rounded">
              👁️ {getVisibleContactsCount()}/10 contacts visible
            </div>
          </div>
          {viewMode === 'master' && properties.length > 100 && (
            <div className="text-xs text-yellow-400 bg-yellow-500/20 px-3 py-1 rounded-full">
              ⚠️ Large dataset - performance may vary
            </div>
          )}
          {viewMode === 'map' && (
            <div className="text-xs text-blue-400 bg-blue-500/20 px-3 py-1 rounded-full">
              🗺️ Interactive location view
            </div>
          )}
        </div>
      </div>

      {/* Content based on view mode */}
      <div className="p-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default PropertyDisplayContainer;
