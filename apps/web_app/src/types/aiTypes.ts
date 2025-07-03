// AI-related type definitions for sales script generation using Vercel AI SDK
import { PropertyData } from '@/lib/dummyProperties';

export interface SelectedProperty {
  property: PropertyData;
  isSelected: boolean;
  priority?: number; // 1-5 for ordering
}

export interface SalesScriptRequest {
  properties: PropertyData[];
  scriptType?: 'formal' | 'casual' | 'persuasive';
  focusAreas?: ('location' | 'amenities' | 'pricing' | 'investment' | 'lifestyle')[];
  targetAudience?: 'family' | 'investor' | 'young_professional' | 'senior';
  maxLength?: 'short' | 'medium' | 'long';
}

export interface SalesScriptResponse {
  propertyId: string;
  propertyTitle: string;
  script: string;
  metadata: {
    scriptType: string;
    targetAudience: string;
    maxLength: string;
    focusAreas: string[];
    generatedAt: string;
  };
}

// AI Property Search types
export interface PropertySearchRequest {
  prompt: string;
  maxResults?: number;
  searchType?: 'basic' | 'detailed' | 'investment';
  priceRange?: 'budget' | 'mid' | 'premium';
  locationPreference?: string[];
}

export interface PropertySearchResponse {
  success: boolean;
  properties: PropertyData[];
  searchCriteria: string;
  totalMatches: number;
  aiExplanation: string;
  searchMetadata: {
    searchType: string;
    priceRange: string;
    maxResults: number;
    generatedAt: string;
    confidenceScore?: number;
  };
  error?: string;
  suggestion?: string;
}

export interface PropertySearchState {
  isSearching: boolean;
  results: PropertyData[];
  searchCriteria: string;
  aiExplanation: string;
  totalMatches: number;
  error: string | null;
  hasSearched: boolean;
  searchMetadata: {
    searchType?: string;
    priceRange?: string;
    confidenceScore?: number;
  } | null;
}
