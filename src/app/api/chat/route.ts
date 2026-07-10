import { GoogleGenerativeAI } from "@google/generative-ai";

// 🔥 200% FIX: Vercel ka timeout default 10s se badhakar 60s kar diya!
// Ab Vercel beech mein connection nahi kaatega chahe code kitna bhi lamba ho.
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
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const aiPrompt = `You are a helpful AI assistant in a collaborative developer workspace. You provide clear, concise, and accurate answers. Always format code blocks beautifully in Markdown. User prompt: ${prompt}`;

    // Yahan AI ko apna poora time milega code generate karne ka
    const result = await model.generateContent(aiPrompt);
    const text = result.response.text();

    return new Response(text, { status: 200 });
    
  } catch (error: any) {
    console.error("AI API Error:", error);
    return new Response(error.message, { status: 500 });
  }
}