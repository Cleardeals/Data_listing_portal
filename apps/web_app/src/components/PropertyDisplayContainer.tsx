"use client";

import React from 'react';
import { PropertyData } from '@/lib/dummyProperties';
import { ViewMode } from './PropertyFiltersPanel';
import {
  CompactTableView,
  GalleryView,
  MasterTableView
} from './PropertyViewModes';

interface PropertyDisplayContainerProps {
  properties: PropertyData[];
  loading: boolean;
  totalCount: number;
  viewMode: ViewMode;
}

const PropertyDisplayContainer: React.FC<PropertyDisplayContainerProps> = ({
  properties,
  loading,
  totalCount,
  viewMode,
}) => {
  const getViewModeTitle = () => {
    switch (viewMode) {
      case 'compact': return '📊 Compact Table';
      case 'gallery': return '🖼️ Gallery View';
      case 'master': return '📜 Master View';
      default: return '📊 Compact Table';
    }
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'compact':
        return <CompactTableView properties={properties} loading={loading} />;
      case 'gallery':
        return <GalleryView properties={properties} loading={loading} />;
      case 'master':
        return <MasterTableView properties={properties} loading={loading} />;
      default:
        return <CompactTableView properties={properties} loading={loading} />;
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
          </div>
          {viewMode === 'master' && properties.length > 100 && (
            <div className="text-xs text-yellow-400 bg-yellow-500/20 px-3 py-1 rounded-full">
              ⚠️ Large dataset - performance may vary
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
