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
      try {
        const roomData = await liveblocks.getRoom(room);
        const defaultAccesses = roomData.defaultAccesses || [];
        const usersAccesses = roomData.usersAccesses || {};

        // THE 3 GOLDEN RULES:
        const isOwner = clerkId && usersAccesses[clerkId]?.includes("room:write");
        const isPublicEdit = defaultAccesses.includes("room:write");
        const isUntouched = defaultAccesses.length === 0 && Object.keys(usersAccesses).length === 0;

        // Give FULL Edit access if they are Owner, or Link is Editable, or Room is newly created
        if (isOwner || isPublicEdit || isUntouched) {
          session.allow(room, session.FULL_ACCESS);
        } else {
          // Strictly lock all Guests if "Can View" is selected
          session.allow(room, session.READ_ACCESS);
        }
      } catch (e) {
        // Room fallback
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
    return new Response(JSON.stringify({ error: "Auth failed" }), { status: 500 });
  }
}