import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response("Sawal khali hai", { status: 400 });
    }

    const result = await streamText({
      // Wapas apna sabse fast aur naya model use kar rahe hain
      model: google('gemini-1.5-flash'),
      system: "You are a helpful AI assistant in a collaborative developer workspace. You provide clear, concise, and accurate answers. Always format code blocks beautifully in Markdown.",
      prompt: prompt,
    });

    // 🔥 YAHAN HAI ASALI FIX 🔥
    // Frontend (useCompletion) ko yahi format chahiye. VS code ka error ignore karo.
    // @ts-ignore
    return result.toDataStreamResponse();
    
  } catch (error) {
    console.error("AI API Error:", error);
    return new Response("Error connecting to AI", { status: 500 });
  }
}