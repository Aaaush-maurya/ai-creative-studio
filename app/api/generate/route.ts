import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseServer } from "../../../lib/serverSupabase";

const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;

interface GenerateRequest {
  prompt: string;
  userId?: string;
  save?: boolean;
}

export async function POST(req: Request) {
  try {
    const { prompt, userId, save }: GenerateRequest = await req.json();

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (!GEMINI_KEY) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY environment variable" },
        { status: 500 }
      );
    }

    // Initialize the Generative AI client
    const genAI = new GoogleGenerativeAI(GEMINI_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-image-preview",
    });

    // Generate image using generateContent
    const result = await model.generateContent(prompt.trim());

    // Extract image data from response
    const response = result.response;
    const candidates = response.candidates;
    
    if (!candidates || candidates.length === 0) {
      return NextResponse.json(
        { error: "No image data returned. Try another prompt." },
        { status: 500 }
      );
    }

    // Look for inline data (base64 image) in the response
    let imageData: string | null = null;
    for (const candidate of candidates) {
      const content = candidate.content;
      if (content?.parts) {
        for (const part of content.parts) {
          if (part.inlineData && part.inlineData.data) {
            imageData = part.inlineData.data;
            break;
          }
        }
      }
      if (imageData) break;
    }

    if (!imageData) {
      return NextResponse.json(
        { error: "No image data returned. Try another prompt." },
        { status: 500 }
      );
    }

    // Upload to Supabase
    const buffer = Buffer.from(imageData, "base64");
    const filename = `generations/${userId || "anon"}/${Date.now()}.png`;

    const { error: uploadError } = await supabaseServer.storage
      .from("generations")
      .upload(filename, buffer, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data: publicData } = supabaseServer.storage
      .from("generations")
      .getPublicUrl(filename);

    const finalUrl = publicData.publicUrl;

    // Save metadata
    if (save && userId && finalUrl) {
      await supabaseServer.from("generations").insert({
        user_id: userId,
        original_prompt: prompt.trim(),
        enhanced_prompt: prompt.trim(),
        image_url: finalUrl,
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ imageUrl: finalUrl });
  } catch (err: any) {
    console.error("Generate error:", err);
    return NextResponse.json(
      { error: `Failed to generate image: ${err.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
