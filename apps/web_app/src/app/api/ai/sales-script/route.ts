import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { PropertyData } from '@/lib/dummyProperties';

interface SalesScriptRequest {
  properties: PropertyData[];
  scriptType?: 'formal' | 'casual' | 'persuasive';
  targetAudience?: 'family' | 'investor' | 'young_professional' | 'senior';
  maxLength?: 'short' | 'medium' | 'long';
  focusAreas?: ('location' | 'amenities' | 'pricing' | 'investment' | 'lifestyle')[];
}

export async function POST(request: NextRequest) {
  try {
    const body: SalesScriptRequest = await request.json();
    const { properties, scriptType = 'formal', targetAudience = 'family', maxLength = 'medium', focusAreas = ['location', 'amenities', 'pricing'] } = body;

    if (!properties || properties.length === 0) {
      return NextResponse.json(
        { error: 'At least one property is required' },
        { status: 400 }
      );
    }

    if (properties.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 properties allowed' },
        { status: 400 }
      );
    }

    // Generate script for each property
    const scripts = await Promise.all(
      properties.map(async (property) => {
        const prompt = createSalesScriptPrompt(property, {
          scriptType,
          targetAudience,
          maxLength,
          focusAreas
        });

        const result = await generateText({
          model: process.env.AI_MODEL || 'groq/llama-3.1-8b-instant',
          prompt,
          temperature: 0.7,
        });

        return {
          propertyId: property.property_id,
          propertyTitle: `${property.property_type} in ${property.area}`,
          script: result.text,
          metadata: {
            scriptType,
            targetAudience,
            maxLength,
            focusAreas,
            generatedAt: new Date().toISOString()
          }
        };
      })
    );

    return NextResponse.json({
      success: true,
      scripts,
      totalProperties: properties.length
    });

  } catch (error) {
    console.error('Error generating sales scripts:', error);
    return NextResponse.json(
      { error: 'Failed to generate sales scripts' },
      { status: 500 }
    );
  }
}

function createSalesScriptPrompt(
  property: PropertyData,
  options: {
    scriptType: string;
    targetAudience: string;
    maxLength: string;
    focusAreas: string[];
  }
): string {
  const { scriptType, targetAudience, maxLength, focusAreas } = options;

  const lengthGuidelines = {
    short: '2-3 paragraphs (150-200 words)',
    medium: '4-5 paragraphs (300-400 words)',
    long: '6-8 paragraphs (500-600 words)'
  };

  const audienceContext = {
    family: 'Focus on safety, schools, family amenities, and community aspects',
    investor: 'Emphasize ROI potential, rental yields, market growth, and appreciation',
    young_professional: 'Highlight modern amenities, connectivity, lifestyle, and convenience',
    senior: 'Focus on accessibility, healthcare proximity, peaceful environment, and community'
  };

  const toneGuidelines = {
    formal: 'Professional, informative, and structured',
    casual: 'Friendly, conversational, and approachable',
    persuasive: 'Compelling, benefit-focused, and action-oriented'
  };

  // Pune-specific location benefits
  const puneLocationContext = `
  Pune Location Benefits:
  - IT Hub with major tech companies (Infosys, TCS, Wipro, etc.)
  - Excellent educational institutions (Pune University, COEP, Symbiosis)
  - Pleasant weather year-round
  - Rich cultural heritage and vibrant social scene
  - Growing infrastructure and metro connectivity
  - Proximity to Mumbai (3 hours) and hill stations
  - Emerging startup ecosystem
  `;

  const focusAreaDetails = {
    location: `Location advantages, connectivity, nearby landmarks, and area development`,
    amenities: `Property amenities, facilities, and lifestyle features`,
    pricing: `Value proposition, pricing benefits, and investment attractiveness`,
    investment: `ROI potential, market trends, and future appreciation`,
    lifestyle: `Living experience, community, and quality of life`
  };

  return `
You are a professional real estate sales expert specializing in Pune properties. Create a compelling sales script for the following property.

PROPERTY DETAILS:
- Property ID: ${property.property_id}
- Property Type: ${property.property_type || 'N/A'}
- Sub Type: ${property.sub_property_type || 'N/A'}
- Area/Location: ${property.area || 'N/A'}
- Address: ${property.address || 'N/A'}
- Size: ${property.size || 'N/A'}
- Price: ${property.rent_or_sell_price ? `₹${property.rent_or_sell_price}` : 'Price on request'}
- Deposit: ${property.deposit ? `₹${property.deposit}` : 'N/A'}
- Furnishing Status: ${property.furnishing_status || 'N/A'}
- Availability: ${property.availability || 'N/A'}
- Floor: ${property.floor || 'N/A'}
- Age: ${property.age || 'N/A'}
- Tenant Preference: ${property.tenant_preference || 'N/A'}
${property.additional_details ? `- Additional Details: ${property.additional_details}` : ''}
${property.special_note ? `- Special Note: ${property.special_note}` : ''}

SCRIPT REQUIREMENTS:
- Target Audience: ${targetAudience} (${audienceContext[targetAudience as keyof typeof audienceContext]})
- Tone: ${scriptType} (${toneGuidelines[scriptType as keyof typeof toneGuidelines]})
- Length: ${lengthGuidelines[maxLength as keyof typeof lengthGuidelines]}
- Focus Areas: ${focusAreas.map(area => focusAreaDetails[area as keyof typeof focusAreaDetails]).join(', ')}

CONTEXT:
${puneLocationContext}

INSTRUCTIONS:
1. Start with an engaging hook that captures attention
2. Highlight the property's unique selling points based on focus areas
3. Incorporate Pune-specific location benefits relevant to the target audience
4. Address potential concerns or objections
5. End with a compelling call-to-action
6. Use Indian Rupee formatting and local references
7. Make it sound natural and conversational, not overly salesy
8. Include specific details from the property data

Generate a compelling sales script that would motivate the target audience to schedule a viewing or make an inquiry.
`;
}
