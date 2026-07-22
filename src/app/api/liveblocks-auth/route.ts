import { currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY as string,
});

export async function POST(request: Request) {
  try {
    const clerkUser = await currentUser();
    const { room } = await request.json();

    // 1. Check if user is logged in or a guest
    const isGuest = !clerkUser;
    const userId = isGuest ? `guest-${Math.random().toString(36).slice(2, 10)}` : clerkUser.id;

    const userInfo = {
      name: isGuest ? "Guest User" : (clerkUser.firstName || clerkUser.username || "Anonymous User"),
      email: isGuest ? "" : (clerkUser.emailAddresses?.[0]?.emailAddress || ""),
      avatar: isGuest ? "" : (clerkUser.imageUrl || ""),
      color: ["#F87171", "#60A5FA", "#34D399", "#FBBF24", "#A78BFA"][Math.floor(Math.random() * 5)],
    };

    const session = liveblocks.prepareSession(userId, { userInfo });

    if (room) {
      try {
        // 2. Fetch the ACTIVE permissions from Share Modal (Liveblocks Database)
        const roomData = await liveblocks.getRoom(room);
        const isPubliclyEditable = roomData.defaultAccesses?.includes("room:write");
        
        // 3. Check if the current user is the VIP Owner
        const isExplicitEditor = roomData.usersAccesses?.[userId]?.includes("room:write");
        const isOrphan = !roomData.usersAccesses || Object.keys(roomData.usersAccesses).length === 0;

        if (isExplicitEditor || (isOrphan && !isGuest)) {
          // 🔥 YOU (THE OWNER): Always get FULL ACCESS to your own document
          session.allow(room, session.FULL_ACCESS);
        } else {
          // 🔒 GUESTS & FRIENDS: Apply Share Modal Logic Here!
          if (isPubliclyEditable) {
            session.allow(room, session.FULL_ACCESS); // If "Can Edit" is selected
          } else {
            session.allow(room, session.READ_ACCESS); // If "Can View" is selected
          }
        }
      } catch (e) {
        // Room not initialized yet
        session.allow(room, session.FULL_ACCESS);
      }
    } else {
      session.allow("*", session.READ_ACCESS);
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