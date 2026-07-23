import { auth, currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY as string,
});

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth(); 
    const user = clerkId ? await currentUser() : null; 
    const { room } = await request.json();

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
      const roomData = await liveblocks.getRoom(room).catch(() => null);

      let accessType = "write";
      let ownerId: string | null = null; // Explicitly defining the type here

      // Agar room ka data milta hai, toh apne lagaye hue 'Tags' (Metadata) padho
      if (roomData && roomData.metadata) {
        // 🔥 FIX: Added 'as string' to satisfy TypeScript's strict type checking
        accessType = (roomData.metadata.access as string) || "write";
        ownerId = (roomData.metadata.ownerId as string) || null;
      }

      // 👑 THE MASTER RULE: Kya tum is document ke Owner ho?
      const isOwner = clerkId && (ownerId === clerkId);

      // Agar tum Owner ho, YA document "Can Edit" par set hai -> Full Access 
      if (isOwner || accessType === "write") {
        session.allow(room, session.FULL_ACCESS);
      } 
      // Agar "Read-Only" set hai, toh baaki sab (Guests & Friends) yahan lock ho jayenge!
      else {
        session.allow(room, session.READ_ACCESS);
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