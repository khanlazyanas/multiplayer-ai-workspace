import { currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY as string,
});

export async function POST(request: Request) {
  try {
    const clerkUser = await currentUser();

    // 1. Identify if it's the Owner (Logged in) or a Guest (Link viewer)
    const isGuest = !clerkUser;
    const userId = isGuest ? `guest-${Math.random().toString(36).slice(2, 10)}` : clerkUser.id;

    // 2. Setup user profile for cursor/avatar
    const userInfo = {
      name: clerkUser?.firstName || clerkUser?.username || "Guest User",
      email: clerkUser?.emailAddresses?.[0]?.emailAddress || "",
      avatar: clerkUser?.imageUrl || "",
      color: ["#F87171", "#60A5FA", "#34D399", "#FBBF24", "#A78BFA"][Math.floor(Math.random() * 5)],
    };

    // 🔥 THE FIX: Added groupIds: [] to satisfy TypeScript strict mode!
    const { status, body } = await liveblocks.identifyUser(
      {
        userId: userId,
        groupIds: [], // <-- Ye line add hui hai
      },
      { userInfo }
    );
    
    return new Response(body, { 
      status, 
      headers: { 'Content-Type': 'application/json' } 
    });
    
  } catch (error) {
    console.error("Liveblocks auth error:", error);
    return new Response(JSON.stringify({ error: "Auth process failed" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}