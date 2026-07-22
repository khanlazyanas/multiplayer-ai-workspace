import { currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY as string,
});

export async function POST(request: Request) {
  try {
    const clerkUser = await currentUser();
    const { room } = await request.json();

    // 1. Check if the user is logged in via Clerk, otherwise assign as a Guest
    // This prevents the mobile white-screen crash by allowing anonymous users
    const isGuest = !clerkUser;
    const userId = isGuest ? `guest-${Math.random().toString(36).slice(2, 10)}` : clerkUser.id;

    // 2. Generate generic info for guests, and real info for logged-in users
    const userInfo = {
      name: isGuest ? "Guest User" : (clerkUser.firstName || clerkUser.username || "Anonymous User"),
      email: isGuest ? "" : (clerkUser.emailAddresses?.[0]?.emailAddress || ""),
      avatar: isGuest ? "" : (clerkUser.imageUrl || ""),
      color: ["#F87171", "#60A5FA", "#34D399", "#FBBF24", "#A78BFA"][Math.floor(Math.random() * 5)],
    };

    const session = liveblocks.prepareSession(userId, { userInfo });

    if (room) {
      try {
        // 3. Fetch the current room settings from the Liveblocks server
        const roomData = await liveblocks.getRoom(room);
        const isPubliclyEditable = roomData.defaultAccesses?.includes("room:write");

        if (isGuest) {
          // 4. If it is a guest (e.g., opening link on mobile without login)
          // Strictly apply the Share Modal rules (Edit or View-Only)
          session.allow(room, isPubliclyEditable ? session.FULL_ACCESS : session.READ_ACCESS);
        } else {
          // 5. If you are a logged-in Clerk user, ALWAYS grant FULL_ACCESS
          // This ensures you are never locked out of your own workspace
          session.allow(room, session.FULL_ACCESS);
        }
      } catch (e) {
        // Room not found on server yet, grant full access to initialize
        session.allow(room, session.FULL_ACCESS);
      }
    } else {
      // Fallback permission
      session.allow("*", session.FULL_ACCESS);
    }

    const { status, body } = await session.authorize();
    
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