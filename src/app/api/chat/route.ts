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
      // 🎯 YAHAN MAGIC HAI: Model ke naam mein '-latest' lagana zaroori tha
      model: google('gemini-1.5-flash-latest'),
      system: "You are a helpful AI assistant in a collaborative developer workspace. You provide clear, concise, and accurate answers. Always format code blocks beautifully in Markdown.",
      prompt: prompt,
    });

    return result.toTextStreamResponse();
    
  } catch (error) {
    console.error("AI API Error:", error);
    return new Response("Error connecting to AI", { status: 500 });
  }
}