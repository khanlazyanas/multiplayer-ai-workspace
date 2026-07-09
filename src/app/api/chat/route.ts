import { google } from '@ai-sdk/google';
import { generateText } from 'ai'; // streamText ki jagah generateText

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    console.log("🤖 BACKEND KO YE SAWAL MILA:", prompt);

    if (!prompt) {
      return new Response("Sawal khali hai", { status: 400 });
    }

    // Yahan hum stream nahi kar rahe, pura answer ek sath aane ka wait karenge
    const { text } = await generateText({
      model: google('gemini-1.5-flash'), // Wapas flash use kar rahe hain
      system: "You are a helpful assistant.",
      prompt: prompt,
    });

    return new Response(text, { status: 200 });
    
  } catch (error: any) {
    // Ye asali error print karega
    console.error("🚨 ASALI API ERROR:", error);
    
    // Aur yahi asali error hum tumhare screen ke Pop-up alert mein bhej rahe hain!
    return new Response(error.message || "Google API ne block kar diya", { status: 500 });
  }
}