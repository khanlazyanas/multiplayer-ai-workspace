import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

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
    const aiPrompt = `You are a helpful AI assistant in a collaborative developer workspace. You provide clear, concise, and accurate answers. Always format code blocks beautifully in Markdown. User prompt: ${prompt}`;

    try {
      // 🚀 KOSHISH 1: Sabse naya model try karo
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const result = await model.generateContent(aiPrompt);
      return new Response(result.response.text(), { status: 200 });
      
    } catch (primaryError: any) {
      // 🛡️ FALLBACK: Agar naya model busy hai (503 Error), toh backup model use karo
      if (primaryError.message.includes("503") || primaryError.message.includes("high demand")) {
        console.log("Primary model is busy. Switching to fallback model...");
        
        // Tumhari key par available backup model
        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const fallbackResult = await fallbackModel.generateContent(aiPrompt);
        return new Response(fallbackResult.response.text(), { status: 200 });
      }
      
      // Agar koi aur error ho toh wapas phenk do
      throw primaryError; 
    }
    
  } catch (error: any) {
    console.error("AI API Error:", error);
    return new Response(error.message, { status: 500 });
  }
}