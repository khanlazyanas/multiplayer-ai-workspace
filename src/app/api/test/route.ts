import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const dynamic = 'force-dynamic';

// Yahan hum POST nahi, GET use kar rahe hain taaki seedha browser mein khul sake
export async function GET() {
  try {
    const { text } = await generateText({
      model: google('gemini-pro'), // Sabse stable model
      prompt: 'Write a 1 line javascript hello world.',
    });

    return new Response("✅ API IS WORKING PERFECTLY! \n\nAnswer: " + text, { status: 200 });
    
  } catch (error: any) {
    return new Response("❌ ASALI API ERROR: " + error.message, { status: 500 });
  }
}