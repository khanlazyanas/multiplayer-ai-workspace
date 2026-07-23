import { auth, currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY as string,
});

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    const user = clerkId ? await currentUser() : null;
    
    // 1. Safely parse the body to prevent silent 500 crashes
    const text = await request.text();
    const body = text ? JSON.parse(text) : {};
    const room = body.room;

    // 2. Differentiate between logged-in user and mobile guest
    const isGuest = !clerkId;
    const liveblocksUserId = isGuest ? `guest-${Math.random().toString(36).slice(2, 10)}` : clerkId;

    const userInfo = {
      name: user?.firstName || user?.username || (isGuest ? "Guest User" : "Anonymous"),
      email: user?.emailAddresses?.[0]?.emailAddress || "",
      avatar: user?.imageUrl || "",
      color: ["#F87171", "#60A5FA", "#34D399", "#FBBF24", "#A78BFA"][Math.floor(Math.random() * 5)],
    };

    // 🔥 3. THE MASTER FIX: Auto-upgrade Private rooms to Public Edit
    if (room) {
      try {
        const roomData = await liveblocks.getRoom(room);
        const isPrivate = !roomData.defaultAccesses || roomData.defaultAccesses.length === 0;
        
        // Agar document naya hai aur share permission set nahi hui hai, isko automatically "Can Edit" par khol do
        if (isPrivate) {
          await liveblocks.updateRoom(room, {
            defaultAccesses: ["room:write"] as any,
          });
        }
      } catch (e) {
        // Agar room ab tak Liveblocks par exist nahi karta hai toh naya create karo
        await liveblocks.createRoom(room, {
          defaultAccesses: ["room:write"] as any,
          usersAccesses: clerkId ? { [clerkId]: ["room:write"] } : {}
        });
      }
    }

    // 4. Generate Official ID Tokens (Liveblocks DB will handle the security smoothly)
    const { status, body: authBody } = await liveblocks.identifyUser(
      { userId: liveblocksUserId, groupIds: [] },
      { userInfo }
    );

    return new Response(authBody, { 
      status, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error("Liveblocks auth error:", error);
    return new Response(JSON.stringify({ error: "Auth failed" }), { status: 500 });
  }
}