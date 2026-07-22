import { currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY as string,
});

export async function POST(request: Request) {
  try {
    const clerkUser = await currentUser();
    const { room } = await request.json();

    // 1. Identify if the user is a Guest (not logged in via Clerk)
    const isGuest = !clerkUser;
    const userId = isGuest ? `guest-${Math.random().toString(36).slice(2, 10)}` : clerkUser.id;

    // 2. Assign appropriate user information for the Liveblocks session
    const userInfo = {
      name: isGuest ? "Guest User" : (clerkUser.firstName || clerkUser.username || "Anonymous User"),
      email: isGuest ? "" : (clerkUser.emailAddresses?.[0]?.emailAddress || ""),
      avatar: isGuest ? "" : (clerkUser.imageUrl || ""),
      color: ["#F87171", "#60A5FA", "#34D399", "#FBBF24", "#A78BFA"][Math.floor(Math.random() * 5)],
    };

    const session = liveblocks.prepareSession(userId, { userInfo });

    if (room) {
      try {
        // 3. Fetch current room settings
        const roomData = await liveblocks.getRoom(room);
        const isPubliclyEditable = roomData.defaultAccesses?.includes("room:write");

        // 4. THE BULLETPROOF OWNER CHECK
        let isOwner = false;
        
        if (clerkUser) {
          // Check if the user is explicitly set as the owner in the room's access list
          const hasExplicitAccess = roomData.usersAccesses?.[clerkUser.id]?.includes("room:write");
          
          // Fallback: If the room was created without assigning an owner (Orphan Room),
          // we assume the logged-in Clerk user is the owner to prevent accidental lockouts.
          const isRoomOrphaned = !roomData.usersAccesses || Object.keys(roomData.usersAccesses).length === 0;
          
          isOwner = hasExplicitAccess || isRoomOrphaned;
        }

        if (isOwner) {
          // 5. The Owner NEVER gets locked out, regardless of the Share Modal settings
          session.allow(room, session.FULL_ACCESS);
        } else {
          // 6. Guests and other non-owner users must respect the Share Modal permissions
          session.allow(room, isPubliclyEditable ? session.FULL_ACCESS : session.READ_ACCESS);
        }
      } catch (e) {
        // 7. If the room does not exist yet (during initial creation)
        session.allow(room, session.FULL_ACCESS);
      }
    } else {
      // 8. Fallback for generic wildcard authorization
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