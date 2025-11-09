import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Support both environment variable names for backward compatibility
const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;

interface EnhanceRequest {
  prompt: string;
}

// We'll use gemini-2.0-flash for prompt enhancement (faster and more capable)
export async function POST(req: Request) {
  try {
    const { prompt }: EnhanceRequest = await req.json();

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Prompt is required' }, 
        { status: 400 }
      );
    }

    if (!GEMINI_KEY) {
      console.error('GEMINI_API_KEY or GOOGLE_GEMINI_API_KEY is not set');
      return NextResponse.json(
        { error: 'Server configuration error: API key not found' }, 
        { status: 500 }
      );
    }

    const userPrompt = prompt.trim();
    
    // Create a clear prompt for enhancement - restaurant-focused
    const enhancementPrompt = `You are a prompt engineering assistant specialized in restaurant and food imagery. Improve the following short prompt into a detailed, vivid, composition-rich text-to-image prompt for restaurant use. Add professional food photography details: lighting (natural, warm, ambient), camera angle (overhead, side, close-up), food styling, plate presentation, background ambiance, colors, textures, and mood. Focus on making it appetizing and restaurant-quality. Keep it to one paragraph. Return ONLY the enhanced prompt, no explanations.

Original prompt: "${userPrompt}"

Enhanced prompt:`;

    // Initialize the Generative AI client
    const genAI = new GoogleGenerativeAI(GEMINI_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      // generationConfig: {
      //   temperature: 0.7,
      //   maxOutputTokens: 300,
      //   topP: 0.8,
      //   topK: 40,
      // }
    });

    // Generate the enhanced prompt
    const result = await model.generateContent(enhancementPrompt);
    const response = await result.response;
    const enhanced = response.text().trim();

    if (!enhanced || !enhanced.trim()) {
      return NextResponse.json(
        { error: 'Enhancement returned empty result. Please try again.' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ enhanced: enhanced.trim() });
  } catch (err: any) {
    console.error('Enhance error:', err);
    
    // Handle specific error types
    if (err?.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'Invalid API key. Please check your GEMINI_API_KEY environment variable.' }, 
        { status: 401 }
      );
    }
    
    if (err?.message?.includes('quota') || err?.message?.includes('rate limit')) {
      return NextResponse.json(
        { error: 'API quota exceeded. Please try again later.' }, 
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: `Failed to enhance prompt: ${err?.message || 'Unknown error'}` }, 
      { status: 500 }
    );
  }
}