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

    // 1. Set public link access
    const defaultAccesses = accessType === "write" 
      ? ["room:write"] 
      : ["room:read", "room:presence:write"];

    // 2. Add Owner securely
    const usersAccesses: any = {};
    if (userId) {
      usersAccesses[userId] = ["room:write"];
    }

    try {
      // Safely update the room permissions
      await liveblocks.updateRoom(roomId, {
        defaultAccesses: defaultAccesses as any,
        usersAccesses: usersAccesses
      });
    } catch (e) {
      // Agar room ab तक server par nahi tha, toh isko create kar do!
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