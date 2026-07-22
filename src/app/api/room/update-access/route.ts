import { Liveblocks } from "@liveblocks/node";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server"; // 🔥 Added Clerk to identify you

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY as string,
});

export async function POST(req: Request) {
  try {
    // 1. Get the current logged-in user (You)
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { roomId, accessType } = await req.json();

    if (!roomId || !accessType) {
      return new NextResponse("Missing parameters", { status: 400 });
    }

    // 2. Decide the public link access
    const defaultAccesses = accessType === "write" 
      ? ["room:write"] 
      : ["room:read", "room:presence:write"];

    // 3. THE ULTIMATE FIX: Update the room AND explicitly add your ID as the VIP Editor!
    const updatedRoom = await liveblocks.updateRoom(roomId, {
      defaultAccesses: defaultAccesses as any,
      usersAccesses: {
        [user.id]: ["room:write"], // 🔥 You will NEVER get locked out now!
      } as any,
    });

    return NextResponse.json(updatedRoom);
  } catch (error) {
    console.error("Error updating room access:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}