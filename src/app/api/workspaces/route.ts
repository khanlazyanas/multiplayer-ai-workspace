import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Workspace from "@/lib/models/workspace.model";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    // 1. Check user authentication
    const user = await currentUser();
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Connect to MongoDB
    await connectToDatabase();

    // 3. Generate a unique room ID
    const roomId = crypto.randomUUID();

    // 4. Create new workspace in database
    const newWorkspace = await Workspace.create({
      roomId,
      ownerId: user.id,
      title: "Untitled Workspace",
      collaborators: [], // By default, only owner has access
    });

    // 5. Return the created workspace data
    return NextResponse.json(newWorkspace);
    
  } catch (error) {
    console.error("Error creating workspace:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}