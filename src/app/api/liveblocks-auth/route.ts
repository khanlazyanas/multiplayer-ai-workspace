import { auth, currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY as string,
});

export async function POST(request: Request) {
  try {
    // FIX: Added 'await' before auth() to resolve the Promise
    const { userId: clerkId } = await auth(); 
    const user = clerkId ? await currentUser() : null; 
    const { room } = await request.json();

    // Differentiate between authenticated owners and anonymous mobile guests
    const isGuest = !clerkId;
    const liveblocksUserId = isGuest ? `guest-${Math.random().toString(36).slice(2, 10)}` : clerkId;

    const userInfo = {
      name: user?.firstName || user?.username || (isGuest ? "Guest User" : "Anonymous"),
      email: user?.emailAddresses?.[0]?.emailAddress || "",
      avatar: user?.imageUrl || "",
      color: ["#F87171", "#60A5FA", "#34D399", "#FBBF24", "#A78BFA"][Math.floor(Math.random() * 5)],
    };

    const session = liveblocks.prepareSession(liveblocksUserId, { userInfo });

    if (room) {
      // Safely fetch room data; if it fails, roomData will be null
      const roomData = await liveblocks.getRoom(room).catch(() => null);

      if (roomData) {
        const defaultAccesses = roomData.defaultAccesses || [];
        const usersAccesses = roomData.usersAccesses || {};

        // Verify access rules
        const isOwner = usersAccesses[liveblocksUserId]?.includes("room:write");
        const isVirginRoom = defaultAccesses.length === 0 && Object.keys(usersAccesses).length === 0;
        const isPublicEdit = defaultAccesses.includes("room:write");

        if (isOwner || isVirginRoom || isPublicEdit) {
          // Grant full access to owners and users in public edit rooms
          session.allow(room, session.FULL_ACCESS);
        } else {
          // Restrict guests to read-only access
          session.allow(room, session.READ_ACCESS);
        }
      } else {
        // Allow access to initialize the room if it doesn't exist yet
        session.allow(room, session.FULL_ACCESS);
      }
    } else {
      session.allow("*", session.FULL_ACCESS);
    }

    const { status, body } = await session.authorize();
    
    return new Response(body, { 
      status, 
      headers: { 'Content-Type': 'application/json' } 
    });
    
  } catch (error) {
    console.error("Liveblocks auth error:", error);
    return new Response(JSON.stringify({ error: "Auth process failed" }), { status: 500 });
  }
}