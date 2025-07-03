"use client";

import React, { useState } from 'react';
import { PropertyData } from '@/lib/dummyProperties';
import { useAISalesScripts } from '@/hooks/useAISalesScripts';
import { SalesScriptRequest, SalesScriptResponse } from '@/types/aiTypes';
import { Button } from '@/components/ui/button';

interface AISalesScriptGeneratorProps {
  properties: PropertyData[];
  onScriptGenerated?: (scripts: SalesScriptResponse[]) => void;
}

const AISalesScriptGenerator: React.FC<AISalesScriptGeneratorProps> = ({
  properties,
  onScriptGenerated
}) => {
  const [showGenerator, setShowGenerator] = useState(false);
  const [generationOptions, setGenerationOptions] = useState<Partial<SalesScriptRequest>>({
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

  const handleOptionChange = (key: keyof SalesScriptRequest, value: string | string[]) => {
    setGenerationOptions(prev => ({ ...prev, [key]: value }));
  };

  if (!showGenerator) {
    return (
      <div className="mb-6">
        <Button
          onClick={() => setShowGenerator(true)}
          className="btn-3d bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        >
          🤖 AI Sales Script Generator (Llama 3.1)
        </Button>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-2xl p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          🤖 AI Sales Script Generator (Llama 3.1)
        </h3>
        <Button
          onClick={() => setShowGenerator(false)}
          variant="outline"
          size="sm"
        >
          Close
        </Button>
      </div>

      {/* Property Selection */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-white">
            Select Properties ({selectedCount}/5)
          </h4>
          {selectedCount > 0 && (
            <Button
              onClick={clearSelection}
              variant="outline"
              size="sm"
              className="text-red-400 border-red-400/30 hover:bg-red-400/10"
            >
              Clear All
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {properties.slice(0, 20).map((property) => { // Limit to first 20 for performance
            const isSelected = isPropertySelected(property.serial_number);
            return (
              <div
                key={property.serial_number}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-purple-500/20 border-purple-400/50 ring-2 ring-purple-400/30'
                    : 'bg-white/5 border-white/20 hover:bg-white/10'
                } ${!canSelectMore && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => {
                  if (canSelectMore || isSelected) {
                    toggleProperty(property);
                  }
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-medium text-white">
                    #{property.serial_number}
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected 
                      ? 'bg-purple-500 border-purple-400' 
                      : 'border-white/40'
                  }`}>
                    {isSelected && <span className="text-white text-xs">✓</span>}
                  </div>
                </div>
                
                <div className="text-sm text-white/80 mb-1">
                  {property.sub_property_type || property.property_type}
                </div>
                <div className="text-xs text-white/60 mb-2">
                  📍 {property.area}
                </div>
                <div className="text-sm font-bold text-green-400">
                  ₹{property.rent_or_sell_price ? parseFloat(property.rent_or_sell_price).toLocaleString() : 'N/A'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Generation Options */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-4">Script Options</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Script Type */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Script Style
            </label>
            <select
              value={generationOptions.scriptType}
              onChange={(e) => handleOptionChange('scriptType', e.target.value as 'formal' | 'casual' | 'premium')}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50"
            >
              <option value="formal">Professional & Formal</option>
              <option value="casual">Friendly & Casual</option>
              <option value="premium">Luxury & Premium</option>
            </select>
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Target Audience
            </label>
            <select
              value={generationOptions.targetAudience}
              onChange={(e) => handleOptionChange('targetAudience', e.target.value as 'family' | 'professional' | 'student' | 'investor')}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50"
            >
              <option value="family">Family</option>
              <option value="professional">Working Professional</option>
              <option value="student">Student</option>
              <option value="investor">Investor</option>
            </select>
          </div>

          {/* Script Length */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Script Length
            </label>
            <select
              value={generationOptions.maxLength}
              onChange={(e) => handleOptionChange('maxLength', e.target.value as 'short' | 'medium' | 'long')}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50"
            >
              <option value="short">Short (100-150 words)</option>
              <option value="medium">Medium (200-300 words)</option>
              <option value="long">Long (400-500 words)</option>
            </select>
          </div>

          {/* Focus Areas */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Key Focus
            </label>
            <select
              onChange={(e) => {
                const focusMap: Record<string, string[]> = {
                  'location': ['location', 'amenities'],
                  'investment': ['pricing', 'investment'],
                  'lifestyle': ['amenities', 'lifestyle'],
                  'balanced': ['location', 'amenities', 'pricing']
                };
                handleOptionChange('focusAreas', focusMap[e.target.value] || ['location', 'amenities', 'pricing']);
              }}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50"
            >
              <option value="balanced">Balanced Approach</option>
              <option value="location">Location & Connectivity</option>
              <option value="investment">Investment & Pricing</option>
              <option value="lifestyle">Lifestyle & Amenities</option>
            </select>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center mb-6">
        <Button
          onClick={handleGenerate}
          disabled={selectedCount === 0 || isGenerating}
          className={`px-8 py-3 text-lg font-semibold ${
            selectedCount === 0
              ? 'bg-gray-500/50 cursor-not-allowed'
              : 'btn-3d bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
          } text-white`}
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border border-white/40 border-t-white rounded-full animate-spin mr-2"></div>
              Generating Scripts...
            </>
          ) : (
            <>🚀 Generate Sales Scripts ({selectedCount})</>
          )}
        </Button>
      </div>

      {/* Error Display */}
      {generationError && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-lg">
          <div className="text-red-200 text-sm">
            <strong>Error:</strong> {generationError}
          </div>
        </div>
      )}

      {/* Generated Scripts */}
      {scripts.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-white">
              Generated Scripts ({scripts.length})
            </h4>
            <Button
              onClick={clearScripts}
              variant="outline"
              size="sm"
            >
              Clear Scripts
            </Button>
          </div>

          <div className="space-y-6">
            {scripts.map((script) => (
              <div key={script.propertyId} className="p-6 bg-white/5 border border-white/20 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <h5 className="text-lg font-semibold text-purple-400">
                    {script.propertyTitle}
                  </h5>
                  <div className="text-xs text-white/60">
                    {script.metadata.scriptType} • {script.metadata.targetAudience}
                  </div>
                </div>

                {/* Main Script */}
                <div className="mb-4">
                  <h6 className="text-sm font-medium text-white/80 mb-2">Sales Script:</h6>
                  <div className="p-4 bg-black/20 rounded-lg text-white/90 text-sm leading-relaxed">
                    {script.script}
                  </div>
                </div>

                {/* Script Metadata */}
                <div className="mb-4 text-xs text-white/60">
                  Focus Areas: {script.metadata.focusAreas.join(', ')} • 
                  Generated: {new Date(script.metadata.generatedAt).toLocaleString()}
                </div>

                {/* Copy Button */}
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(script.script);
                      // You could add a toast notification here
                    }}
                    variant="outline"
                    size="sm"
                    className="text-blue-400 border-blue-400/30 hover:bg-blue-400/10"
                  >
                    📋 Copy Script
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AISalesScriptGenerator;
