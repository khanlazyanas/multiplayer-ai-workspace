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
      return new Response("API Key missing hai!", { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 🔥 YAHAN MODEL NAME BILKUL SAHI LIKHA HAI: gemini-2.5-flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const aiPrompt = `You are a helpful AI assistant. Answer in English: ${prompt}`;

    const result = await model.generateContent(aiPrompt);
    const text = result.response.text();

    return new Response(text, { status: 200 });
    
  } catch (error: any) {
    console.error("AI API Error:", error);
    return new Response(error.message, { status: 500 });
  }
}