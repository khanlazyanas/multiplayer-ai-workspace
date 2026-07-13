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

export async function GET(req: Request) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDatabase();

    // Database se wo saare workspaces nikal rahe hain jiska owner ye user hai
    // .sort({ updatedAt: -1 }) se sabse naye workspaces upar aayenge
    const workspaces = await Workspace.find({ ownerId: user.id }).sort({ updatedAt: -1 });

    return NextResponse.json(workspaces);
    
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}