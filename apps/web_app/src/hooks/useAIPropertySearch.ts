// React hook for AI-powered property search functionality
"use client";

import { useState, useCallback } from 'react';
import { PropertyData } from '@/lib/dummyProperties';
import { PropertySearchRequest, PropertySearchResponse, PropertySearchState } from '@/types/aiTypes';

export interface UseAIPropertySearchOptions {
  maxResults?: number;
  defaultSearchType?: 'basic' | 'detailed' | 'investment';
  defaultPriceRange?: 'budget' | 'mid' | 'premium';
  onSearchComplete?: (results: PropertyData[]) => void;
  onError?: (error: string) => void;
}

export interface UseAIPropertySearchReturn {
  // Search state
  searchState: PropertySearchState;
  
  // Search functions
  searchProperties: (
    prompt: string, 
    options?: { searchType?: 'basic' | 'detailed' | 'investment'; priceRange?: 'budget' | 'mid' | 'premium' }
  ) => Promise<void>;
  clearSearch: () => void;
  
  // Utilities
  canSearch: boolean;
  getSearchSummary: () => string;
}

export const useAIPropertySearch = (options: UseAIPropertySearchOptions = {}): UseAIPropertySearchReturn => {
  const {
    maxResults = 15,
    defaultSearchType = 'basic',
    defaultPriceRange = 'mid',
    onSearchComplete,
    onError
  } = options;

  // Search state
  const [searchState, setSearchState] = useState<PropertySearchState>({
    isSearching: false,
    results: [],
    searchCriteria: '',
    aiExplanation: '',
    totalMatches: 0,
    error: null,
    hasSearched: false,
    searchMetadata: null
  });

  // Search properties using AI
  const searchProperties = useCallback(async (
    prompt: string, 
    options?: { searchType?: 'basic' | 'detailed' | 'investment'; priceRange?: 'budget' | 'mid' | 'premium' }
  ) => {
    if (!prompt || prompt.trim().length === 0) {
      setSearchState(prev => ({
        ...prev,
        error: 'Please enter a search prompt'
      }));
      return;
    }

    setSearchState(prev => ({
      ...prev,
      isSearching: true,
      error: null,
      hasSearched: false
    }));

    try {
      const requestBody: PropertySearchRequest = {
        prompt: prompt.trim(),
        maxResults,
        searchType: options?.searchType || defaultSearchType,
        priceRange: options?.priceRange || defaultPriceRange,
        locationPreference: []
      };

      const response = await fetch('/api/ai/property-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: PropertySearchResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Search failed');
      }

      setSearchState(prev => ({
        ...prev,
        isSearching: false,
        results: data.properties,
        searchCriteria: data.searchCriteria,
        aiExplanation: data.aiExplanation,
        totalMatches: data.totalMatches,
        error: null,
        hasSearched: true,
        searchMetadata: {
          searchType: data.searchMetadata?.searchType,
          priceRange: data.searchMetadata?.priceRange,
          confidenceScore: data.searchMetadata?.confidenceScore
        }
      }));

      // Call success callback
      if (onSearchComplete) {
        onSearchComplete(data.properties);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setSearchState(prev => ({
        ...prev,
        isSearching: false,
        error: errorMessage,
        hasSearched: true,
        results: [],
        searchCriteria: '',
        aiExplanation: '',
        totalMatches: 0,
        searchMetadata: null
      }));

      // Call error callback
      if (onError) {
        onError(errorMessage);
      }

      console.error('Property search error:', error);
    }
  }, [maxResults, defaultSearchType, defaultPriceRange, onSearchComplete, onError]);

  // Clear search results
  const clearSearch = useCallback(() => {
    setSearchState({
      isSearching: false,
      results: [],
      searchCriteria: '',
      aiExplanation: '',
      totalMatches: 0,
      error: null,
      hasSearched: false,
      searchMetadata: null
    });
  }, []);

  // Get search summary
  const getSearchSummary = useCallback(() => {
    if (!searchState.hasSearched) {
      return 'No search performed yet';
    }
    
    if (searchState.error) {
      return `Search failed: ${searchState.error}`;
    }
    
    if (searchState.totalMatches === 0) {
      return 'No properties found matching your criteria';
    }
    
    return `Found ${searchState.totalMatches} matching ${searchState.totalMatches === 1 ? 'property' : 'properties'}`;
  }, [searchState]);

  const canSearch = !searchState.isSearching;

  return {
    searchState,
    searchProperties,
    clearSearch,
    canSearch,
    getSearchSummary
  };
};
