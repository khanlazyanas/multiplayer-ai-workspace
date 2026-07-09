import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response("Sawal khali hai", { status: 400 });
    }

    // Yahan humne tumhara Taskmind wala exact tarika use kiya hai
    // Dhyan rahe, .env.local mein GOOGLE_GENERATIVE_AI_API_KEY hi honi chahiye
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
    
    // Gemini 1.5 Flash sabse best aur fast hai
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const aiPrompt = `You are a helpful AI assistant in a collaborative developer workspace. You provide clear, concise, and accurate answers. Always format code blocks beautifully in Markdown. User prompt: ${prompt}`;

    // Generate Content (Bina streaming ke, exactly like Taskmind)
    const result = await model.generateContent(aiPrompt);
    const text = result.response.text();

    // Plain text response bhej rahe hain jisko frontend asani se padh lega
    return new Response(text, { status: 200 });
    
  } catch (error: any) {
    console.error("AI API Error:", error);
    return new Response(error.message || "Error connecting to AI", { status: 500 });
  }
}