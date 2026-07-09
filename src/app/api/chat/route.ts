import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Vercel Edge ko hata diya taaki stream break na ho
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    // DEBUGGER: Ye check karega ki backend ko asali sawal kya mila
    console.log("🤖 BACKEND KO YE SAWAL MILA:", prompt);

    if (!prompt || prompt.trim() === "") {
      return new Response("Sawal khali hai", { status: 400 });
    }

    const result = await streamText({
      // Sabse stable base model use kar rahe hain
      model: google('gemini-pro'),
      system: "You are a helpful AI assistant in a collaborative developer workspace. You provide clear, concise, and accurate answers. Always format code blocks beautifully in Markdown.",
      prompt: prompt,
    });

    return result.toTextStreamResponse();
    
  } catch (error) {
    console.error("AI API Asali Error:", error);
    return new Response("Error connecting to AI", { status: 500 });
  }
}