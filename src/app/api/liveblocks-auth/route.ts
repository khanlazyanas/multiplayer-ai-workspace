import { auth, currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY as string,
});

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth(); 
    const user = clerkId ? await currentUser() : null; 
    
    // 🔥 THE CRITICAL FIX: Safely parse the body to prevent silent 500 crashes
    const text = await request.text();
    const body = text ? JSON.parse(text) : {};
    const room = body.room;

    const isGuest = !clerkId;
    const liveblocksUserId = isGuest ? `guest-${Math.random().toString(36).slice(2, 10)}` : clerkId;

    const userInfo = {
      name: user?.firstName || user?.username || (isGuest ? "Guest User" : "Anonymous"),
      email: user?.emailAddresses?.[0]?.emailAddress || "",
      avatar: user?.imageUrl || "",
      color: ["#F87171", "#60A5FA", "#34D399", "#FBBF24", "#A78BFA"][Math.floor(Math.random() * 5)],
    };

    // Use prepareSession to strictly enforce permissions bypassing any config limits
    const session = liveblocks.prepareSession(liveblocksUserId, { userInfo });

    if (room) {
      let roomData = null;
      try {
        roomData = await liveblocks.getRoom(room);
      } catch (e) {
        // Room not created on Liveblocks yet
      }

      if (roomData) {
        const defaultAccesses = roomData.defaultAccesses || [];
        const usersAccesses = roomData.usersAccesses || {};

        // 3 Golden Rules
        const isOwner = clerkId && usersAccesses[clerkId]?.includes("room:write");
        const isPublicEdit = defaultAccesses.includes("room:write");
        const isUntouched = defaultAccesses.length === 0 && Object.keys(usersAccesses).length === 0;

        // Give access if Owner, OR public link, OR untouched new room
        if (isOwner || isPublicEdit || isUntouched) {
          session.allow(room, session.FULL_ACCESS);
        } else {
          session.allow(room, session.READ_ACCESS); // Lock strictly
        }
      } else {
        // Let the first user in to trigger auto-creation
        session.allow(room, session.FULL_ACCESS);
      }
    } else {
      session.allow("*", session.FULL_ACCESS);
    }

    const { status, body: authBody } = await session.authorize();
    
    return new Response(authBody, { 
      status, 
      headers: { 'Content-Type': 'application/json' } 
    });
    
  } catch (error) {
    console.error("Liveblocks auth error:", error);
    return new Response(JSON.stringify({ error: "Auth process failed" }), { status: 500 });
  }
}