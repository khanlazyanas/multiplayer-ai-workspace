import { currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY as string,
});

export async function POST(request: Request) {
  try {
    const clerkUser = await currentUser();
    const { room } = await request.json();

    // 1. Identify User (Clerk Logged in OR Mobile Guest)
    const isGuest = !clerkUser;
    const userId = isGuest ? `guest-${Math.random().toString(36).slice(2, 10)}` : clerkUser.id;

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
        
        // 2. Safely get current room permissions
        const defaultAccesses = roomData.defaultAccesses || [];
        const usersAccesses = roomData.usersAccesses || {};

        // 3. THE 3 GOLDEN RULES (Mathematical Checks)
        // Rule A: Kya ye user is room ka VIP Owner hai?
        const isOwner = usersAccesses[userId]?.includes("room:write");
        
        // Rule B: Kya ye ekdum naya room hai jisme abhi tak Share button use nahi hua?
        const isRoomEmpty = defaultAccesses.length === 0 && Object.keys(usersAccesses).length === 0;
        
        // Rule C: Kya Share modal se "Can Edit" select kiya gaya hai?
        const isPublicEdit = defaultAccesses.includes("room:write");

        // 4. Decision Time:
        if (isOwner || isRoomEmpty || isPublicEdit) {
          session.allow(room, session.FULL_ACCESS); // Type karne do
        } else {
          session.allow(room, session.READ_ACCESS); // Strictly lock kar do
        }
        
      } catch (e) {
        // Room agar server par nahi bani hai toh initialize karne do
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
    return new Response(JSON.stringify({ error: "Auth process failed" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}