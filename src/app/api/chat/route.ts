import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response("Sawal khali hai", { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    if (!apiKey) {
      return new Response("Backend ko API Key nahi mili!", { status: 500 });
    }

    // 🔥 THE MASTER STROKE: Google se pucho abhi kaunsa model available hai
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (!data.models) {
        return new Response("Google API Key galat hai ya block ho chuki hai.", { status: 500 });
    }

    // Jo model 'generateContent' support karte hain, unki list nikalo
    const availableModels = data.models
      .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent") && m.name.includes("gemini"))
      .map((m: any) => m.name.replace("models/", ""));

    if (availableModels.length === 0) {
        return new Response("Tumhari API Key par abhi koi active Gemini model nahi hai.", { status: 500 });
    }

    // Sabse best (flash wala) model automatically utha lo, ya phir list ka pehla model
    const selectedModel = availableModels.find((m: string) => m.includes("flash")) || availableModels[0];
    
    // Ab humara code perfectly zinda model use karega!
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: selectedModel });

    const aiPrompt = `You are a helpful AI assistant in a collaborative developer workspace. You provide clear, concise, and accurate answers. Always format code blocks beautifully in Markdown. User prompt: ${prompt}`;

    const result = await model.generateContent(aiPrompt);
    const text = result.response.text();

    return new Response(text, { status: 200 });
    
  } catch (error: any) {
    console.error("AI API Error:", error);
    return new Response(error.message || "Google API Crash ho gayi", { status: 500 });
  }
}