"use client";

import React, { useState } from 'react';
import { PropertyData } from '@/lib/dummyProperties';
import { useAISalesScripts } from '@/hooks/useAISalesScripts';
import { SalesScriptRequest, SalesScriptResponse } from '@/types/aiTypes';

interface AISalesScriptGeneratorProps {
  properties: PropertyData[];
  onScriptGenerated?: (scripts: SalesScriptResponse[]) => void;
}

const AISalesScriptGenerator: React.FC<AISalesScriptGeneratorProps> = ({
  properties,
  onScriptGenerated
}) => {
  const [showGenerator, setShowGenerator] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const propertiesPerPage = 20;
  
  const [generationOptions] = useState<Partial<SalesScriptRequest>>({
    scriptType: 'formal',
    targetAudience: 'family',
    maxLength: 'medium',
    focusAreas: ['location', 'amenities', 'pricing']
  });

  const {
    toggleProperty,
    generateScripts,
    isGenerating,
    scripts,
    generationError,
    canSelectMore,
    selectedCount,
    isPropertySelected,
    clearScripts,
    clearSelection
  } = useAISalesScripts({
    maxSelections: 5,
    defaultScriptType: 'formal',
    defaultTargetAudience: 'family'
  });

  const handleGenerate = async () => {
    await generateScripts(generationOptions);
    if (onScriptGenerated) {
      onScriptGenerated(scripts);
    }
  };

  // Filter properties based on search term - includes area, address, owner name, property type, and serial number
  const filteredProperties = properties.filter(property => {
    const searchLower = searchTerm.toLowerCase();
    return (
      property.area?.toLowerCase().includes(searchLower) ||
      property.address?.toLowerCase().includes(searchLower) ||
      property.owner_name?.toLowerCase().includes(searchLower) ||
      property.property_type?.toLowerCase().includes(searchLower) ||
      property.sub_property_type?.toLowerCase().includes(searchLower) ||
      property.serial_number?.toString().includes(searchTerm) ||
      property.additional_details?.toLowerCase().includes(searchLower) ||
      property.special_note?.toLowerCase().includes(searchLower)
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
  const startIndex = (currentPage - 1) * propertiesPerPage;
  const paginatedProperties = filteredProperties.slice(startIndex, startIndex + propertiesPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (!showGenerator) {
    return (
      <div className="mb-4 sm:mb-6">
        <button
          onClick={() => setShowGenerator(true)}
          className="w-full px-4 sm:px-6 py-3 sm:py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg touch-manipulation text-sm sm:text-base"
        >
          🤖 AI Sales Script Generator
        </button>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-6 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-6 gap-3 sm:gap-0">
        <h3 className="text-base sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          🤖 AI Sales Script Generator
        </h3>
        <button
          onClick={() => setShowGenerator(false)}
          className="self-start sm:self-auto px-3 py-1.5 text-xs sm:text-sm bg-slate-700/80 border border-white/20 text-white rounded-md hover:bg-slate-600/80 transition-colors touch-manipulation"
        >
          Close
        </button>
      </div>

      {/* Selected Properties Summary */}
      <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
        <div className="text-sm text-white/80">
          {selectedCount > 0 ? `${selectedCount} properties selected` : 'No properties selected'}
        </div>
        {selectedCount > 0 && (
          <button
            onClick={clearSelection}
            className="px-3 py-1.5 text-sm bg-red-600/80 border border-red-400/30 text-white rounded-md hover:bg-red-500/80 transition-colors touch-manipulation self-start sm:self-auto"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Property Selection with Search and Pagination */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-2 sm:gap-0">
          <h4 className="text-sm sm:text-lg font-semibold text-white">
            Select Properties ({selectedCount}/5)
          </h4>
          <div className="text-xs sm:text-sm text-white/60">
            Total: {filteredProperties.length} properties
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-3 sm:mb-4">
          <input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
            }}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base touch-manipulation"
            style={{ fontSize: '16px' }}
          />
        </div>

        {/* Property Cards - Horizontal Scroll */}
        <div className="relative">
          <div className="flex gap-3 overflow-x-auto pb-4 max-h-64 sm:max-h-48 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {paginatedProperties.map((property) => {
            const isSelected = isPropertySelected(property.serial_number);
            return (
              <div
                key={property.serial_number}
                className={`card-hover-3d backdrop-blur-sm border rounded-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer flex-shrink-0 w-72 sm:w-80 ${
                  isSelected
                    ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/50 ring-2 ring-purple-400/30'
                    : 'bg-gradient-to-br from-white/10 to-white/5 border-white/20 hover:border-blue-400/40'
                } ${!canSelectMore && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => {
                  if (canSelectMore || isSelected) {
                    toggleProperty(property);
                  }
                }}
              >
                <div className="flex flex-row h-36 sm:h-40">
                  {/* Image/Icon Section - Left Side */}
                  <div className={`w-16 sm:w-20 h-full flex items-center justify-center border-r flex-shrink-0 ${
                    isSelected 
                      ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-purple-400/50' 
                      : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-white/20'
                  }`}>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl mb-1">
                        {property.property_type?.includes('Res') ? '🏠' : '🏢'}
                      </div>
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center mx-auto ${
                        isSelected 
                          ? 'bg-purple-500 border-purple-400' 
                          : 'border-white/40'
                      }`}>
                        {isSelected && <span className="text-white text-xs">✓</span>}
                      </div>
                    </div>
                  </div>

                  {/* Content Section - Right Side */}
                  <div className="flex-1 p-2 sm:p-3 flex flex-col justify-between min-w-0">
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
                          <span className="text-blue-400 text-xs">ℹ️</span>
                          <span className="text-blue-400 text-xs font-medium truncate">
                            {property.availability || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Section - Price */}
                    <div className="border-t border-white/10 pt-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-green-400">
                            ₹{property.rent_or_sell_price ? parseFloat(property.rent_or_sell_price).toLocaleString() : 'N/A'}
                          </div>
                          <div className="text-xs text-white/60">
                            {property.property_type?.includes('rental') ? 'Per Month' : 'Total'}
                          </div>
                        </div>
                        
                        {/* Selection Indicator */}
                        <div className="ml-2">
                          {isSelected && (
                            <div className="text-xs text-purple-300 font-medium">
                              Selected ✓
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
          {/* Scroll Hint */}
          {paginatedProperties.length > 3 && (
            <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-slate-900/80 to-transparent pointer-events-none flex items-center justify-end pr-2">
              <div className="text-white/40 text-xs">→</div>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div className="text-xs sm:text-sm text-white/60 order-2 sm:order-1">
              Page {currentPage} of {totalPages} • Showing {paginatedProperties.length} of {filteredProperties.length} properties
            </div>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-slate-700/80 border border-white/20 text-white rounded-md hover:bg-slate-600/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                Prev
              </button>
              
              {/* Page numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (pageNum <= totalPages) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 text-xs sm:text-sm rounded-md transition-colors touch-manipulation ${
                          currentPage === pageNum 
                            ? 'bg-purple-500 text-white border border-purple-400' 
                            : 'bg-slate-700/80 border border-white/20 text-white hover:bg-slate-600/80'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  return null;
                })}
              </div>
              
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-slate-700/80 border border-white/20 text-white rounded-md hover:bg-slate-600/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <div className="flex justify-center mb-4 sm:mb-6">
        <button
          onClick={handleGenerate}
          disabled={selectedCount === 0 || isGenerating}
          className="w-full px-6 sm:px-8 py-3 sm:py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation text-sm sm:text-base"
        >
          {isGenerating ? 'Generating Scripts...' : `Generate Scripts (${selectedCount} properties)`}
        </button>
      </div>

      {/* Error Display */}
      {generationError && (
        <div className="mb-3 sm:mb-4 p-3 bg-red-500/10 border border-red-400/30 rounded-lg text-red-300 text-xs sm:text-sm break-words">
          {generationError}
        </div>
      )}

      {/* Generated Scripts Display */}
      {scripts.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
            <h4 className="text-sm sm:text-lg font-semibold text-white">Generated Sales Scripts</h4>
            <button
              onClick={clearScripts}
              className="px-3 py-1.5 text-sm bg-red-600/80 border border-red-400/30 text-white rounded-md hover:bg-red-500/80 transition-colors touch-manipulation self-start sm:self-auto"
            >
              Clear Scripts
            </button>
          </div>
          
          {scripts.map((script, index) => (
            <div key={index} className="bg-white/5 border border-white/20 rounded-lg p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2 sm:gap-0">
                <div>
                  <h5 className="font-medium text-white">Property #{script.propertyId}</h5>
                  <div className="text-sm text-white/60">{script.metadata.scriptType} • {script.metadata.targetAudience}</div>
                </div>
              </div>
              
              <div className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap break-words">
                {script.script}
              </div>
              
              {script.metadata.focusAreas && script.metadata.focusAreas.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <h6 className="text-sm font-medium text-white/80 mb-2">Focus Areas:</h6>
                  <ul className="text-xs text-white/70 space-y-1">
                    {script.metadata.focusAreas.map((area: string, i: number) => (
                      <li key={i}>• {area}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AISalesScriptGenerator;
