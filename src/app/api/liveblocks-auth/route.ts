import { currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY as string,
});

export async function POST(request: Request) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userInfo = {
      name: clerkUser.firstName || clerkUser.username || "Anonymous",
      avatar: clerkUser.imageUrl,
      color: ["#F87171", "#60A5FA", "#34D399", "#FBBF24", "#A78BFA"][Math.floor(Math.random() * 5)],
    };

    const session = liveblocks.prepareSession(
      clerkUser.id,
      { userInfo } 
    );

    // 🚀 Fix: JSON parsing hata diya aur authenticated user ko wildcard (*) se saare rooms ka access de diya
    session.allow("*", session.FULL_ACCESS);

    const { status, body } = await session.authorize();
    
    return new Response(body, { status, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error("Liveblocks auth error:", error);
    return new Response("Auth failed", { status: 500 });
  }
}