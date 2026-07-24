import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// 🔥 MAGIC: Gemini ke stream ko Web ReadableStream me convert karne wala engine
function createStream(generateStream: any) {
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of generateStream) {
          const chunkText = chunk.text();
          if (chunkText) {
            // Text ko binary packets me encode karke frontend bhejna
            controller.enqueue(new TextEncoder().encode(chunkText));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });
}

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
    const aiPrompt = `You are a highly advanced AI assistant embedded in a Top-Tier collaborative developer workspace. You provide clear, concise, and incredibly accurate answers. Always format code blocks beautifully in Markdown. User prompt: ${prompt}`;

    try {
      // 🚀 KOSHISH 1: Naya model with STREAMING
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const result = await model.generateContentStream(aiPrompt);
      
      const stream = createStream(result.stream);
      
      // SSE (Server-Sent Events) Headers
      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
      
    } catch (primaryError: any) {
      // 🛡️ FALLBACK: Agar naya model busy hai (503 Error), toh backup model use karo
      if (primaryError.message?.includes("503") || primaryError.message?.includes("high demand") || primaryError.message?.includes("overloaded")) {
        console.log("Primary model is busy. Switching to fallback streaming model...");
        
        // Tumhari key par available backup model with STREAMING
        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const fallbackResult = await fallbackModel.generateContentStream(aiPrompt);
        
        const fallbackStream = createStream(fallbackResult.stream);
        
        return new Response(fallbackStream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
          },
        });
      }
      
      // Agar koi aur error ho toh wapas phenk do
      throw primaryError; 
    }
    
  } catch (error: any) {
    console.error("AI API Error:", error);
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }
}