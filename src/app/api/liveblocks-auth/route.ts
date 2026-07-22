import { currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY as string,
});

export async function POST(request: Request) {
  try {
    const clerkUser = await currentUser();
    const { room } = await request.json();

    // 1. Identify Guests smoothly without crashing
    const isGuest = !clerkUser;
    const userId = isGuest ? `guest-${Math.random().toString(36).slice(2, 10)}` : clerkUser.id;

    // Optional Chaining (?.) ensures we don't get errors if a user isn't fully set up
    const userInfo = {
      name: clerkUser?.firstName || clerkUser?.username || "Guest User",
      email: clerkUser?.emailAddresses?.[0]?.emailAddress || "",
      avatar: clerkUser?.imageUrl || "",
      color: ["#F87171", "#60A5FA", "#34D399", "#FBBF24", "#A78BFA"][Math.floor(Math.random() * 5)],
    };

    const session = liveblocks.prepareSession(userId, { userInfo });

    if (room) {
      try {
        const roomData = await liveblocks.getRoom(room);
        
        // 🔥 THE ULTIMATE FIX: Align Backend Default with Frontend UI Default
        // If the permissions are untouched (empty), assume it is "Can Edit" because our UI defaults to that!
        const isUntouched = !roomData.defaultAccesses || roomData.defaultAccesses.length === 0;
        const isPubliclyEditable = isUntouched || roomData.defaultAccesses.includes("room:write");
        
        const isExplicitEditor = roomData.usersAccesses?.[userId]?.includes("room:write");
        const isOrphan = !roomData.usersAccesses || Object.keys(roomData.usersAccesses).length === 0;

        if (isExplicitEditor || (isOrphan && !isGuest)) {
          // 👑 OWNER: Always gets full editing powers
          session.allow(room, session.FULL_ACCESS);
        } else {
          // 👨‍💻 GUESTS: Follow the Share Modal Rules perfectly
          if (isPubliclyEditable) {
            session.allow(room, session.FULL_ACCESS); // Guest can type
          } else {
            session.allow(room, session.READ_ACCESS); // Guest is locked
          }
        }
      } catch (e) {
        // If the room is not initialized on the server yet
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