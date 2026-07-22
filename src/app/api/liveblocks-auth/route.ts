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

    // 1. Extract the requested room ID from the frontend request
    const { room } = await request.json();

    const userInfo = {
      name: clerkUser.firstName || clerkUser.username || "Anonymous User",
      email: clerkUser.emailAddresses?.[0]?.emailAddress || "",
      avatar: clerkUser.imageUrl || "",
      color: ["#F87171", "#60A5FA", "#34D399", "#FBBF24", "#A78BFA"][Math.floor(Math.random() * 5)],
    };

    const session = liveblocks.prepareSession(
      clerkUser.id,
      { userInfo } 
    );

    if (room) {
      try {
        // 2. Fetch the current room settings from the Liveblocks server
        const roomData = await liveblocks.getRoom(room);
        
        // 3. Check if the room's default public access allows editing
        const isPubliclyEditable = roomData.defaultAccesses?.includes("room:write");
        
        // 4. Check if the current user is an explicit owner/editor of this room
        // (The creator's ID is typically stored in usersAccesses)
        const isOwnerOrEditor = roomData.usersAccesses?.[clerkUser.id]?.includes("room:write");

        if (isOwnerOrEditor || isPubliclyEditable) {
          // Grant FULL_ACCESS if the room is publicly editable or the user is an owner/editor
          session.allow(room, session.FULL_ACCESS);
        } else {
          // Otherwise, restrict to READ_ACCESS (Applying Share Modal RBAC)
          session.allow(room, session.READ_ACCESS);
        }
      } catch (e) {
        // Room is not yet created on the server (First time load scenario)
        session.allow(room, session.FULL_ACCESS);
      }
    } else {
      // Fallback to read-only for unknown requests
      session.allow("*", session.READ_ACCESS);
    }

    const { status, body } = await session.authorize();
    
    return new Response(body, { 
      status, 
      headers: { 'Content-Type': 'application/json' } 
    });
    
  } catch (error) {
    console.error("Liveblocks auth error:", error);
    return new Response(JSON.stringify({ error: "Auth failed" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}