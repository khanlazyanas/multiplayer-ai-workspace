import { Liveblocks } from "@liveblocks/node";
import { NextResponse } from "next/server";

// Ensure you have LIVEBLOCKS_SECRET_KEY in your .env file
const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY as string,
});

export async function POST(req: Request) {
  try {
    const { roomId, accessType } = await req.json();

    if (!roomId || !accessType) {
      return new NextResponse("Missing parameters", { status: 400 });
    }

    // 🔥 FIX: Inline condition with 'as any' to bypass TypeScript's strict generic string array check
    const updatedRoom = await liveblocks.updateRoom(roomId, {
      defaultAccesses: (accessType === "write" 
        ? ["room:write"] 
        : ["room:read", "room:presence:write"]) as any,
    });

    return NextResponse.json(updatedRoom);
  } catch (error) {
    console.error("Error updating room access:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}