import { Liveblocks } from "@liveblocks/node";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server"; 

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY as string,
});

export async function POST(req: Request) {
  try {
    // FIX: Added 'await' because auth() returns a Promise in newer Clerk versions
    const { userId } = await auth(); 
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { roomId, accessType } = await req.json();

    if (!roomId || !accessType) {
      return new NextResponse("Missing parameters", { status: 400 });
    }

    // Determine permissions for guests based on the selected access type
    const defaultAccesses = accessType === "write" 
      ? ["room:write"] 
      : ["room:read", "room:presence:write"];

    // Force save the current user as the explicit owner to prevent lockouts
    await liveblocks.updateRoom(roomId, {
      defaultAccesses: defaultAccesses as any,
      usersAccesses: {
        [userId]: ["room:write"], 
      } as any,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating room access:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}