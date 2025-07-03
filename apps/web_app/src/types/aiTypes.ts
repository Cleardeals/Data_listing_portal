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
