import { Liveblocks } from "@liveblocks/node";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server"; 

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY as string,
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth(); 
    const { roomId, accessType } = await req.json();

    if (!roomId || !accessType) {
      return new NextResponse("Missing parameters", { status: 400 });
    }

    // "write" = Can Edit, "read" = Can View (Locked)
    const defaultAccesses = accessType === "write" 
      ? ["room:write"] 
      : ["room:read", "room:presence:write"];

    // Owner ko hamesha VIP (Write) access rahega
    const usersAccesses: any = {};
    if (userId) {
      usersAccesses[userId] = ["room:write"];
    }

    try {
      // Update room in Liveblocks DB
      await liveblocks.updateRoom(roomId, {
        defaultAccesses: defaultAccesses as any,
        usersAccesses: usersAccesses
      });
    } catch (e) {
      // Fallback agar room nahi tha
      await liveblocks.createRoom(roomId, {
        defaultAccesses: defaultAccesses as any,
        usersAccesses: usersAccesses
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update access error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}