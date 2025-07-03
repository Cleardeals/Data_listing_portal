// React hook for managing AI-powered sales script generation
import { useState, useCallback } from 'react';
import { PropertyData } from '@/lib/dummyProperties';
import { 
  SelectedProperty, 
  SalesScriptRequest, 
  SalesScriptResponse 
} from '@/types/aiTypes';

export interface UseAISalesScriptsOptions {
  maxSelections?: number;
  defaultScriptType?: 'formal' | 'casual' | 'persuasive';
  defaultTargetAudience?: 'family' | 'investor' | 'young_professional' | 'senior';
}

export interface UseAISalesScriptsReturn {
  // Selection management
  selectedProperties: SelectedProperty[];
  selectProperty: (property: PropertyData) => void;
  deselectProperty: (serialNumber: number) => void;
  clearSelection: () => void;
  toggleProperty: (property: PropertyData) => void;
  reorderProperty: (serialNumber: number, newPriority: number) => void;
  
  // Script generation
  generateScripts: (options?: Partial<SalesScriptRequest>) => Promise<void>;
  isGenerating: boolean;
  scripts: SalesScriptResponse[];
  generationError: string | null;
  
  // Utilities
  canSelectMore: boolean;
  selectedCount: number;
  isPropertySelected: (serialNumber: number) => boolean;
  clearScripts: () => void;
}

export const useAISalesScripts = (options: UseAISalesScriptsOptions = {}): UseAISalesScriptsReturn => {
  const {
    maxSelections = 5,
    defaultScriptType = 'formal',
    defaultTargetAudience = 'family'
  } = options;

  // State management
  const [selectedProperties, setSelectedProperties] = useState<SelectedProperty[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [scripts, setScripts] = useState<SalesScriptResponse[]>([]);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Selection management functions
  const selectProperty = useCallback((property: PropertyData) => {
    setSelectedProperties(prev => {
      // Check if already selected
      if (prev.find(p => p.property.serial_number === property.serial_number)) {
        return prev;
      }
      
      // Check max selections
      if (prev.length >= maxSelections) {
        return prev;
      }
      
      const newSelection: SelectedProperty = {
        property,
        isSelected: true,
        priority: prev.length + 1
      };
      
      return [...prev, newSelection];
    });
  }, [maxSelections]);

  const deselectProperty = useCallback((serialNumber: number) => {
    setSelectedProperties(prev => {
      const filtered = prev.filter(p => p.property.serial_number !== serialNumber);
      // Reorder priorities
      return filtered.map((item, index) => ({
        ...item,
        priority: index + 1
      }));
    });
  }, []);

  const toggleProperty = useCallback((property: PropertyData) => {
    const isSelected = selectedProperties.find(p => p.property.serial_number === property.serial_number);
    if (isSelected) {
      deselectProperty(property.serial_number);
    } else {
      selectProperty(property);
    }
  }, [selectedProperties, selectProperty, deselectProperty]);

  const clearSelection = useCallback(() => {
    setSelectedProperties([]);
    setScripts([]);
    setGenerationError(null);
  }, []);

  const reorderProperty = useCallback((serialNumber: number, newPriority: number) => {
    setSelectedProperties(prev => {
      const updated = [...prev];
      const itemIndex = updated.findIndex(p => p.property.serial_number === serialNumber);
      
      if (itemIndex === -1 || newPriority < 1 || newPriority > updated.length) {
        return prev;
      }
      
      // Remove item and reinsert at new position
      const [item] = updated.splice(itemIndex, 1);
      updated.splice(newPriority - 1, 0, item);
      
      // Update all priorities
      return updated.map((item, index) => ({
        ...item,
        priority: index + 1
      }));
    });
  }, []);

  // Script generation using Vercel AI SDK API
  const generateScripts = useCallback(async (overrideOptions: Partial<SalesScriptRequest> = {}) => {
    if (selectedProperties.length === 0) {
      setGenerationError('Please select at least one property');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setScripts([]);

    try {
      const request = {
        properties: selectedProperties
          .sort((a, b) => (a.priority || 0) - (b.priority || 0))
          .map(sp => sp.property),
        scriptType: defaultScriptType,
        targetAudience: defaultTargetAudience,
        maxLength: 'medium',
        focusAreas: ['location', 'amenities', 'pricing'],
        ...overrideOptions
      };

      const response = await fetch('/api/ai/sales-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate scripts');
      }

      const data = await response.json();
      setScripts(data.scripts);
      
      // Track analytics if needed
      console.log(`Generated ${data.scripts.length} sales scripts using Vercel AI Gateway`);
      
    } catch (error) {
      console.error('Failed to generate sales scripts:', error);
      setGenerationError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedProperties, defaultScriptType, defaultTargetAudience]);

  const clearScripts = useCallback(() => {
    setScripts([]);
    setGenerationError(null);
  }, []);

  // Utility computations
  const selectedCount = selectedProperties.length;
  const canSelectMore = selectedCount < maxSelections;
  
  const isPropertySelected = useCallback((serialNumber: number): boolean => {
    return selectedProperties.some(p => p.property.serial_number === serialNumber);
  }, [selectedProperties]);

  return {
    // Selection management
    selectedProperties,
    selectProperty,
    deselectProperty,
    clearSelection,
    toggleProperty,
    reorderProperty,
    
    // Script generation
    generateScripts,
    isGenerating,
    scripts,
    generationError,
    
    // Utilities
    canSelectMore,
    selectedCount,
    isPropertySelected,
    clearScripts,
  };
};
