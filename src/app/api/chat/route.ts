import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response("Sawal khali hai", { status: 400 });
    }

    // 🔥 FIX: Taskmind wala aur Naya dono keys check kar raha hai
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    if (!apiKey) {
      return new Response("Backend ko API Key nahi mili! Vercel Environment Variables check karo.", { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const aiPrompt = `You are a helpful AI assistant in a collaborative developer workspace. You provide clear, concise, and accurate answers. Always format code blocks beautifully in Markdown. User prompt: ${prompt}`;

    const result = await model.generateContent(aiPrompt);
    const text = result.response.text();

    return new Response(text, { status: 200 });
    
  } catch (error: any) {
    console.error("AI API Error:", error);
    // Asali error frontend ko bhej rahe hain
    return new Response(error.message || "Google API Crash ho gayi", { status: 500 });
  }
}