import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Next.js ko allow karo ki API response stream kar sake (max 30 seconds)
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    // Editor se aane wala message extract karo
    const { prompt } = await req.json();

    // Gemini API ko call karo aur live streaming response mango
    const result = await streamText({
      model: google('gemini-1.5-flash'),
      system: "You are a helpful AI assistant in a collaborative developer workspace. You provide clear, concise, and accurate answers. Always format code blocks beautifully in Markdown.",
      prompt: prompt,
    });

    // Error fixed: toTextStreamResponse() use karna hai latest version ke liye
    return result.toTextStreamResponse();
    
  } catch (error) {
    console.error("AI API Error:", error);
    return new Response("Error connecting to AI", { status: 500 });
  }
}