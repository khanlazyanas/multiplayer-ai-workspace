import { auth, currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY as string,
});

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth(); 
    const user = clerkId ? await currentUser() : null; 
    
    // Parse body to get the room ID
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

    // 🚨 THE MASTER FIX: Ensure room exists with "Can Edit" by default!
    if (room) {
      try {
        await liveblocks.getRoom(room);
      } catch (e) {
        // Agar room nahi bana hai, toh isko zabardasti "Write" (Public Edit) access ke sath banao.
        // Isse "normal link" share karte hi guests turant type kar payenge!
        await liveblocks.createRoom(room, {
          defaultAccesses: ["room:write"], 
          usersAccesses: clerkId ? { [clerkId]: ["room:write"] } : {}
        });
      }
    }

    // 🔥 Switch back to Official ID Tokens. No complex math required here anymore!
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