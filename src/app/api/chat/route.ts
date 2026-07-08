import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Vercel ko bata rahe hain ki ise live streaming (Edge) par chalana hai
export const dynamic = 'force-dynamic';
export const runtime = 'edge'; 
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    // Agar galti se khali sawal aaya toh yahi rok do
    if (!prompt) {
      return new Response("Sawal khali hai", { status: 400 });
    }

    const result = await streamText({
      model: google('gemini-1.5-flash'),
      system: "You are a helpful AI assistant in a collaborative developer workspace. You provide clear, concise, and accurate answers. Always format code blocks beautifully in Markdown.",
      prompt: prompt,
    });

    return result.toTextStreamResponse();
    
  } catch (error) {
    // Ye asali error Vercel ke dashboard (Logs) mein print hoga
    console.error("AI API Asali Error:", error);
    return new Response("Error connecting to AI", { status: 500 });
  }
}