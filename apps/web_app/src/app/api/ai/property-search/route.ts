import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PropertyData } from '@/lib/dummyProperties';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface PropertySearchRequest {
  prompt: string;
  maxResults?: number;
  searchType?: 'basic' | 'detailed' | 'investment';
  priceRange?: 'budget' | 'mid' | 'premium';
  locationPreference?: string[];
}

interface SearchAnalysis {
  criteria: string;
  extractedRequirements: {
    propertyTypes: string[];
    locations: string[];
    budgetRange: string;
    amenities: string[];
    size: string;
    other: string[];
  };
}

interface SearchOptions {
  searchType: string;
  priceRange: string;
  maxResults: number;
}

interface MatchResult {
  properties: PropertyData[];
  explanation: string;
  confidenceScore: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: PropertySearchRequest = await request.json();
    const { 
      prompt, 
      maxResults = 15, 
      searchType = 'basic',
      priceRange = 'mid',
      locationPreference = []
    } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'A search prompt is required' },
        { status: 400 }
      );
    }

    if (maxResults > 20) {
      return NextResponse.json(
        { error: 'Maximum 20 results allowed' },
        { status: 400 }
      );
    }

    // Validate prompt is about property search using AI
    const promptValidation = await validatePropertySearchPrompt(prompt);
    if (!promptValidation.isValid) {
      return NextResponse.json(
        { 
          error: 'Invalid prompt. Please provide a prompt related to finding properties, such as describing your location preferences, budget, property type, or living requirements.',
          suggestion: 'Example: "Looking for a 2BHK apartment in Baner under 30K with parking" or "Need a family-friendly house near schools in Kothrud"'
        },
        { status: 400 }
      );
    }

    // Generate search criteria and explanation using AI
    const searchAnalysis = await analyzeSearchPrompt(prompt, {
      searchType,
      priceRange,
      locationPreference
    });
    
    // Fetch all properties from Supabase
    const { data: allProperties, error: dbError } = await supabase
      .from('propertydata')
      .select('*')
      .eq('visibility', true)
      .order('serial_number', { ascending: false });

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to fetch properties from database' },
        { status: 500 }
      );
    }

    if (!allProperties || allProperties.length === 0) {
      return NextResponse.json({
        success: true,
        properties: [],
        searchCriteria: searchAnalysis.criteria,
        totalMatches: 0,
        aiExplanation: 'No properties found in the database.',
        searchMetadata: {
          searchType,
          priceRange,
          maxResults,
          generatedAt: new Date().toISOString()
        }
      });
    }

    // Use AI to rank and filter properties based on the prompt
    const matchedResults = await findMatchingProperties(
      prompt,
      allProperties,
      searchAnalysis,
      { searchType, priceRange, maxResults }
    );

    return NextResponse.json({
      success: true,
      properties: matchedResults.properties,
      searchCriteria: searchAnalysis.criteria,
      totalMatches: matchedResults.properties.length,
      aiExplanation: matchedResults.explanation,
      searchMetadata: {
        searchType,
        priceRange,
        maxResults,
        generatedAt: new Date().toISOString(),
        confidenceScore: matchedResults.confidenceScore
      }
    });

  } catch (error) {
    console.error('Error in property search:', error);
    return NextResponse.json(
      { error: 'Failed to search properties' },
      { status: 500 }
    );
  }
}

async function validatePropertySearchPrompt(prompt: string): Promise<{ isValid: boolean; reason?: string }> {
  try {
    // Quick validation for obvious property-related keywords
    const propertyKeywords = [
      'apartment', 'house', 'flat', 'property', 'bhk', 'room', 'rent', 'buy', 'sell',
      'baner', 'wakad', 'pune', 'kothrud', 'location', 'area', 'budget', 'price',
      'parking', 'furnished', 'unfurnished', 'amenities', 'gym', 'pool', 'garden',
      'balcony', 'terrace', 'floor', 'sqft', 'square', 'commercial', 'residential',
      'lakh', 'crore', 'thousand', 'investment', 'family', 'bachelor', 'office'
    ];
    
    const lowerPrompt = prompt.toLowerCase();
    const hasPropertyKeywords = propertyKeywords.some(keyword => 
      lowerPrompt.includes(keyword)
    );
    
    // If it contains obvious property keywords, it's likely valid
    if (hasPropertyKeywords) {
      return { isValid: true };
    }
    
    // Use AI validation for ambiguous cases
    const validationPrompt = `
You are a property search validator. Determine if the following user prompt is related to finding, searching, or filtering properties/real estate.

User prompt: "${prompt}"

Valid prompts include requests about:
- Property type (apartment, house, commercial, etc.)
- Location/area preferences
- Budget or price range
- Amenities (parking, gym, pool, etc.)
- Size requirements (BHK, square feet)
- Furnishing preferences
- Tenant preferences
- Floor preferences
- Proximity to landmarks, schools, offices
- Living preferences or lifestyle requirements

Invalid prompts include:
- Unrelated topics (weather, food, general chat)
- Inappropriate content
- Non-property related questions

Respond with only "VALID" if the prompt is about property search, or "INVALID" if it's not.
`;

    const result = await generateText({
      model: process.env.AI_MODEL || 'groq/llama-3.1-8b-instant',
      prompt: validationPrompt,
      temperature: 0.1,
    });

    const response = result.text.trim().toUpperCase();
    const isValid = response.includes('VALID') && !response.includes('INVALID');
    
    return {
      isValid,
      reason: !isValid ? 'Prompt is not related to property search' : undefined
    };

  } catch (error) {
    console.error('Error validating prompt:', error);
    // Default to valid if AI validation fails
    return { isValid: true };
  }
}

async function analyzeSearchPrompt(
  prompt: string, 
  options: { searchType: string; priceRange: string; locationPreference: string[] }
): Promise<SearchAnalysis> {
  try {
    const analysisPrompt = `
You are a property search expert for Pune, India. Analyze the user's search prompt and extract detailed requirements.

User prompt: "${prompt}"
Search Type: ${options.searchType}
Price Range Preference: ${options.priceRange}
Location Preferences: ${options.locationPreference.join(', ') || 'None specified'}

Extract and categorize the search requirements:

1. Property Types (apartment, house, commercial, etc.)
2. Specific Locations/Areas in Pune
3. Budget/Price Range (if mentioned)
4. Amenities/Features needed
5. Size requirements (BHK, sqft, etc.)
6. Other specific requirements

Provide a clear, professional summary in 2-3 sentences that explains what the user is looking for.
Focus on Pune-specific areas and use local context.

Example: "Looking for a 2-3 BHK apartment in Baner or Wakad area with parking, priced under ₹50 lakhs, preferably semi-furnished with modern amenities for a young professional."
`;

    const result = await generateText({
      model: process.env.AI_MODEL || 'groq/llama-3.1-8b-instant',
      prompt: analysisPrompt,
      temperature: 0.3,
    });

    const criteria = result.text.trim();
    
    return {
      criteria: criteria || 'General property search based on user preferences',
      extractedRequirements: {
        propertyTypes: [],
        locations: [],
        budgetRange: '',
        amenities: [],
        size: '',
        other: []
      }
    };

  } catch (error) {
    console.error('Error analyzing search prompt:', error);
    return {
      criteria: `Property search based on: "${prompt}"`,
      extractedRequirements: {
        propertyTypes: [],
        locations: [],
        budgetRange: '',
        amenities: [],
        size: '',
        other: []
      }
    };
  }
}

async function findMatchingProperties(
  userPrompt: string,
  properties: PropertyData[],
  searchAnalysis: SearchAnalysis,
  options: SearchOptions
): Promise<MatchResult> {
  try {
    // Create a focused dataset for AI analysis
    const propertiesData = properties.slice(0, 80).map(property => ({
      id: property.serial_number,
      property_id: property.property_id,
      type: property.property_type,
      sub_type: property.sub_property_type,
      area: property.area,
      address: property.address,
      size: property.size,
      price: property.rent_or_sell_price,
      deposit: property.deposit,
      furnishing: property.furnishing_status,
      availability: property.availability,
      floor: property.floor,
      tenant_preference: property.tenant_preference,
      age: property.age,
      additional_details: property.additional_details,
      special_note: property.special_note
    }));

    const matchingPrompt = createPropertyMatchingPrompt(
      userPrompt, 
      searchAnalysis, 
      propertiesData, 
      options
    );

    const result = await generateText({
      model: process.env.AI_MODEL || 'groq/llama-3.1-8b-instant',
      prompt: matchingPrompt,
      temperature: 0.2,
    });

    let aiResponse;
    try {
      // Clean and parse AI response
      let responseText = result.text.trim();
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        responseText = responseText.substring(jsonStart, jsonEnd);
      }
      
      aiResponse = JSON.parse(responseText);
      
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.log('Raw AI response:', result.text);
      
      // Fallback: extract property IDs from text
      const numbers = result.text.match(/\d+/g);
      const extractedIds = numbers ? numbers.slice(0, options.maxResults).map(Number) : [];
      
      aiResponse = {
        ranked_property_ids: extractedIds,
        explanation: 'Properties selected based on available criteria (using fallback matching)',
        confidence_score: 0.6
      };
    }

    const rankedIds = aiResponse.ranked_property_ids || [];
    
    // Filter and order properties based on AI ranking
    const matchedProperties = rankedIds
      .map((id: number) => properties.find(p => p.serial_number === id))
      .filter(Boolean)
      .slice(0, options.maxResults);

    // Add fallback properties if needed
    if (matchedProperties.length < Math.min(options.maxResults, 5)) {
      const usedIds = new Set(matchedProperties.map((p: PropertyData) => p.serial_number));
      const fallbackProperties = properties
        .filter((p: PropertyData) => !usedIds.has(p.serial_number))
        .slice(0, options.maxResults - matchedProperties.length);
      
      matchedProperties.push(...fallbackProperties);
    }

    return {
      properties: matchedProperties.slice(0, options.maxResults),
      explanation: aiResponse.explanation || 'Properties matched based on your requirements',
      confidenceScore: aiResponse.confidence_score || 0.8
    };

  } catch (error) {
    console.error('Error finding matching properties:', error);
    return {
      properties: properties.slice(0, options.maxResults),
      explanation: 'Showing available properties (using fallback search)',
      confidenceScore: 0.5
    };
  }
}

function createPropertyMatchingPrompt(
  userPrompt: string,
  searchAnalysis: SearchAnalysis,
  propertiesData: Record<string, unknown>[],
  options: SearchOptions
): string {
  const searchTypeContext = {
    basic: 'Focus on core requirements like location, type, and price',
    detailed: 'Consider all amenities, specific features, and lifestyle factors',
    investment: 'Prioritize ROI potential, rental yields, and market appreciation'
  };

  const priceRangeContext = {
    budget: 'Focus on affordable options with good value',
    mid: 'Balance between features and price',
    premium: 'Emphasize luxury features and prime locations'
  };

  return `
You are a property matching expert for Pune real estate. Match properties based on user requirements.

USER REQUIREMENTS: "${userPrompt}"
SEARCH ANALYSIS: "${searchAnalysis.criteria}"
SEARCH TYPE: ${options.searchType} (${searchTypeContext[options.searchType as keyof typeof searchTypeContext]})
PRICE PREFERENCE: ${options.priceRange} (${priceRangeContext[options.priceRange as keyof typeof priceRangeContext]})

AVAILABLE PROPERTIES (top 80 for analysis):
${JSON.stringify(propertiesData.slice(0, 60), null, 2)}

INSTRUCTIONS:
1. Analyze each property against user requirements
2. Consider: location match, property type, price range, amenities, size
3. Rank properties by relevance (best matches first)
4. Return top ${Math.min(options.maxResults, 15)} property serial numbers
5. Provide confidence score (0.1-1.0) based on match quality
6. Explain why these properties were selected

RESPOND IN EXACT JSON FORMAT:
{
  "ranked_property_ids": [1, 2, 3],
  "explanation": "Brief explanation of matching criteria and selection reasoning",
  "confidence_score": 0.85
}

Focus on properties that best match the user's specific needs. If no perfect matches exist, prioritize the closest alternatives.
`;
}
