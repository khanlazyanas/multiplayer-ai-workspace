import { currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY as string,
});

export async function POST(request: Request) {
  try {
    // 1. Clerk se pata karo ki kaunsa user login hai
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return new Response("Unauthorized", { status: 401 });
    }

    // 2. User ki details extract karo (Naam aur Avatar)
    const userInfo = {
      name: clerkUser.firstName || clerkUser.username || "Anonymous",
      avatar: clerkUser.imageUrl,
      color: ["#F87171", "#60A5FA", "#34D399", "#FBBF24", "#A78BFA"][Math.floor(Math.random() * 5)], // Cursor ke liye random mast color
    };

    // 3. Liveblocks ka session create karo is user ke liye
    const session = liveblocks.prepareSession(
      clerkUser.id,
      { userInfo } 
    );

    // 4. Abhi ke liye sabko default room ka access de rahe hain
    session.allow("workspace-room-1", session.FULL_ACCESS);

    const { status, body } = await session.authorize();
    
    return new Response(body, { status });
  } catch (error) {
    console.error("Liveblocks auth error:", error);
    return new Response("Auth failed", { status: 500 });
  }
}