import { NextRequest } from 'next/server';
import { generateText } from 'ai';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface RealEstateMentorRequest {
  message: string;
  chatHistory?: ChatMessage[];
  context?: 'training' | 'legal' | 'market' | 'general';
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export async function POST(request: NextRequest) {
  try {
    const body: RealEstateMentorRequest = await request.json();
    const { 
      message, 
      chatHistory = [], 
      context = 'general',
      userLevel = 'beginner'
    } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return Response.json({
        success: false,
        error: 'Please provide a valid message'
      }, { status: 400 });
    }

    if (!process.env.AI_GATEWAY_API_KEY) {
      return Response.json({
        success: false,
        error: 'AI service configuration error'
      }, { status: 500 });
    }

    // Create the mentor persona prompt
    const mentorPrompt = createRealEstateMentorPrompt(message, chatHistory, context, userLevel);

    // Generate response using Vercel AI SDK
    const result = await generateText({
      model: process.env.AI_MODEL || 'groq/llama-3.1-8b-instant',
      prompt: mentorPrompt,
      temperature: 0.8, // Higher temperature for more personality
    });

    // Parse the response to extract structured information
    const parsedResponse = parseEstateMentorResponse(result.text);

    return Response.json({
      success: true,
      response: parsedResponse.response,
      context: parsedResponse.context,
      tips: parsedResponse.tips,
      resources: parsedResponse.resources,
      nextSteps: parsedResponse.nextSteps,
    });

  } catch (error) {
    console.error('Real Estate Mentor API Error:', error);
    return Response.json({
      success: false,
      error: 'Failed to get mentor response. Please try again.',
    }, { status: 500 });
  }
}

function createRealEstateMentorPrompt(
  message: string,
  chatHistory: ChatMessage[],
  context: string,
  userLevel: string
): string {
  const levelGuidance = {
    beginner: 'Explain concepts from basics, use simple terms, provide step-by-step guidance',
    intermediate: 'Assume some knowledge, focus on practical applications and common challenges',
    advanced: 'Provide in-depth insights, advanced strategies, and market nuances'
  };

  const contextFocus = {
    training: 'Focus on skill development, learning resources, and career advancement',
    legal: 'Emphasize legal requirements, documentation, compliance, and regulations',
    market: 'Discuss market trends, pricing strategies, and investment opportunities',
    general: 'Provide comprehensive real estate guidance covering all aspects'
  };

  const chatContext = chatHistory.length > 0 
    ? `\n\nPREVIOUS CONVERSATION:\n${chatHistory.slice(-6).map(msg => 
        `${msg.role.toUpperCase()}: ${msg.content}`
      ).join('\n')}\n`
    : '';

  return `
You are "Kaka" - a seasoned real estate broker from Pune with 25+ years of experience. You have deep knowledge of Pune's real estate market, legal frameworks, and local culture. You primarily communicate in English but naturally sprinkle in local Marathi phrases and Pune-specific references to add authenticity and warmth.

PERSONALITY TRAITS:
- Experienced, wise, and patient mentor
- Speaks primarily in English with occasional Marathi words for emphasis
- Uses local terms naturally (like "saheb", "kaka", "dada", "tai", "area", "society")
- References Pune landmarks, areas, and local culture
- Shares practical wisdom from years of experience
- Encouraging but realistic about challenges
- Sometimes tells short anecdotes from your career

LANGUAGE STYLE:
- PRIMARY: English (90% of response)
- SECONDARY: Marathi words/phrases (10% for flavor and authenticity)
- Use 1-2 Marathi terms per response maximum
- Keep it natural and readable for English speakers
- Translate or explain Marathi terms when first used

EXPERTISE AREAS:
- Pune real estate market (all areas from Hadapsar to Hinjewadi, Baner to Kondhwa)
- Legal documentation (7/12, 8A, NOC, permissions)
- RERA regulations and compliance
- Property valuation and negotiation tactics
- Investment strategies for different budgets
- Builder relationships and project analysis
- Rental market dynamics
- Commercial vs residential insights

LOCAL KNOWLEDGE:
- Pune's geography and connectivity (Metro, IT parks, schools)
- Area-wise price trends and growth potential
- Local festivals, culture affecting real estate
- Monsoon considerations for properties
- Traffic patterns and infrastructure development

USER LEVEL: ${userLevel} (${levelGuidance[userLevel as keyof typeof levelGuidance]})
CONTEXT FOCUS: ${context} (${contextFocus[context as keyof typeof contextFocus]})

CURRENT USER MESSAGE: "${message}"
${chatContext}

RESPONSE GUIDELINES:
1. Respond primarily in English with 1-2 appropriate Marathi words for authenticity
2. Address the user as "boss", "friend", or occasionally "saheb" 
3. Reference specific Pune areas or landmarks when relevant
4. Share practical tips and real-world insights
5. Be encouraging but honest about challenges
6. End with actionable advice or next steps
7. Keep responses conversational, warm, and professional

RESPONSE FORMAT (provide a natural conversational response, but structure your thinking around):
- Main response addressing their question
- 2-3 practical tips if applicable
- Relevant resources or references
- Suggested next steps for their learning/situation

Respond as the experienced Kaka would, with warmth, wisdom, and local insight. Keep responses conversational but informative, primarily in English with just a touch of local flavor.
`;
}

function parseEstateMentorResponse(aiResponse: string): {
  response: string;
  context: string;
  tips: string[];
  resources: string[];
  nextSteps: string[];
} {
  try {
    // Try to extract structured information from the response
    const lines = aiResponse.split('\n').filter(line => line.trim());
    
    let response = '';
    const tips: string[] = [];
    const resources: string[] = [];
    const nextSteps: string[] = [];
    
    let currentSection = 'response';
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.toLowerCase().includes('tips:') || trimmed.toLowerCase().includes('tip:')) {
        currentSection = 'tips';
        continue;
      } else if (trimmed.toLowerCase().includes('resources:') || trimmed.toLowerCase().includes('reference:')) {
        currentSection = 'resources';
        continue;
      } else if (trimmed.toLowerCase().includes('next steps:') || trimmed.toLowerCase().includes('next step:')) {
        currentSection = 'nextSteps';
        continue;
      }
      
      if (currentSection === 'response' && trimmed) {
        response += (response ? ' ' : '') + trimmed;
      } else if (currentSection === 'tips' && trimmed.startsWith('-') || trimmed.match(/^\d+\./)) {
        tips.push(trimmed.replace(/^[-\d.]\s*/, ''));
      } else if (currentSection === 'resources' && trimmed.startsWith('-') || trimmed.match(/^\d+\./)) {
        resources.push(trimmed.replace(/^[-\d.]\s*/, ''));
      } else if (currentSection === 'nextSteps' && trimmed.startsWith('-') || trimmed.match(/^\d+\./)) {
        nextSteps.push(trimmed.replace(/^[-\d.]\s*/, ''));
      }
    }
    
    // If no structured sections found, treat entire response as main response
    if (!response && tips.length === 0 && resources.length === 0 && nextSteps.length === 0) {
      response = aiResponse.trim();
    }
    
    return {
      response: response || aiResponse.trim(),
      context: 'real-estate-mentoring',
      tips,
      resources,
      nextSteps
    };
    
  } catch (error) {
    console.error('Error parsing mentor response:', error);
    return {
      response: aiResponse.trim(),
      context: 'real-estate-mentoring',
      tips: [],
      resources: [],
      nextSteps: []
    };
  }
}
