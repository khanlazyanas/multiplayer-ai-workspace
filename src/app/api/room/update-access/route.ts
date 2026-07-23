import { Liveblocks } from "@liveblocks/node";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server"; 
import { revalidatePath } from "next/cache"; // 🔥 Nayi line add ki hai

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY as string,
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth(); 
    
    const text = await req.text();
    const body = text ? JSON.parse(text) : {};
    const { roomId, accessType } = body;

    if (!roomId || !accessType) {
      return new NextResponse("Missing parameters", { status: 400 });
    }

    const defaultAccesses = accessType === "write" 
      ? ["room:write"] 
      : ["room:read", "room:presence:write"];

    const usersAccesses: any = {};
    if (userId) {
      usersAccesses[userId] = ["room:write"];
    }

    try {
      await liveblocks.updateRoom(roomId, {
        defaultAccesses: defaultAccesses as any,
        usersAccesses: usersAccesses
      });
    } catch (e) {
      await liveblocks.createRoom(roomId, {
        defaultAccesses: defaultAccesses as any,
        usersAccesses: usersAccesses
      });
    }

    // 🔥 THE MAGIC FIX: Ye Next.js ko force karega ki UI ko turant update kare bina manual refresh ke!
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update access error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}