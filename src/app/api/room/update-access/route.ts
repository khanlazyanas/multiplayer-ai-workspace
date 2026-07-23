import { Liveblocks } from "@liveblocks/node";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server"; 

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY as string,
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth(); 
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { roomId, accessType } = await req.json();

    if (!roomId || !accessType) {
      return new NextResponse("Missing parameters", { status: 400 });
    }

    let room;
    try {
      room = await liveblocks.getRoom(roomId);
    } catch (e) {
      room = null; // Agar room nahi bana hai
    }

    if (room) {
      // Agar room pehle se hai, toh sirf uska Metadata 'Tag' update karo
      await liveblocks.updateRoom(roomId, {
        metadata: {
          ...room.metadata,
          access: accessType, // "write" ya "read"
          ownerId: room.metadata.ownerId || userId, // Tumhe hamesha ke liye Owner bana dega
        }
      });
    } else {
      // Agar room ekdum naya hai, toh usko create karo aur Tag lagao
      await liveblocks.createRoom(roomId, {
        defaultAccesses: [], // Inko khali chhod do taaki Liveblocks beech mein tang na adaye
        metadata: {
          access: accessType,
          ownerId: userId,
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating room access:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}