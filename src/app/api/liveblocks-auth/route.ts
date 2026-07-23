import { auth, currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY as string,
});

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth(); 
    const user = clerkId ? await currentUser() : null; 
    
    // Request body se room ID nikalna
    const body = await request.json();
    const room = body.room;

    const isGuest = !clerkId;
    const liveblocksUserId = isGuest ? `guest-${Math.random().toString(36).slice(2, 10)}` : clerkId;

    const userInfo = {
      name: user?.firstName || user?.username || (isGuest ? "Guest User" : "Anonymous"),
      email: user?.emailAddresses?.[0]?.emailAddress || "",
      avatar: user?.imageUrl || "",
      color: ["#F87171", "#60A5FA", "#34D399", "#FBBF24", "#A78BFA"][Math.floor(Math.random() * 5)],
    };

    // 🔥 THE MASTER FIX: Intercept and Fix "Private" Rooms Automatically!
    if (room) {
      let roomData = await liveblocks.getRoom(room).catch(() => null);

      if (!roomData) {
        // Condition 1: Agar room bilkul nahi bana hai, toh "Public Edit" ke sath banao
        await liveblocks.createRoom(room, {
          defaultAccesses: ["room:write"],
          usersAccesses: clerkId ? { [clerkId]: ["room:write"] } : {}
        });
      } else {
        // Condition 2: Agar Frontend ne chup-chap Private room bana diya hai, toh usko OVERRIDE karo!
        const isPrivateByDefault = !roomData.defaultAccesses || roomData.defaultAccesses.length === 0;
        const hasNoOwner = !roomData.usersAccesses || Object.keys(roomData.usersAccesses).length === 0;

        if (isPrivateByDefault && hasNoOwner) {
          await liveblocks.updateRoom(room, {
            defaultAccesses: ["room:write"], // Zabardasti "Can Edit" daal do
            usersAccesses: clerkId ? { [clerkId]: ["room:write"] } : {}
          });
        }
      }
    }

    // Ab official ID tokens generate karo. Database ab 100% sahi permissions dega.
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