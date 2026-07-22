import { currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY as string,
});

export async function POST(request: Request) {
  try {
    const clerkUser = await currentUser();
    const { room } = await request.json();

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
        const roomData = await liveblocks.getRoom(room);
        const isPubliclyEditable = roomData.defaultAccesses?.includes("room:write");

        // Verify if the logged in user is actually the specific owner/creator
        let isOwner = false;
        if (clerkUser) {
          const hasWriteAccess = roomData.usersAccesses?.[clerkUser.id]?.includes("room:write");
          const isEmailOwner = roomData.metadata?.email === clerkUser.emailAddresses?.[0]?.emailAddress;
          isOwner = hasWriteAccess || isEmailOwner;
        }

        if (isOwner) {
          // You (the owner) always get Full Access
          session.allow(room, session.FULL_ACCESS);
        } else {
          // ANYONE ELSE (Friends who are logged in OR Guests) get restricted by Share Modal
          session.allow(room, isPubliclyEditable ? session.FULL_ACCESS : session.READ_ACCESS);
        }
      } catch (e) {
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