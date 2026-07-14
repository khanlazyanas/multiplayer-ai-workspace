import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Workspace from "@/lib/models/workspace.model";
import { currentUser } from "@clerk/nextjs/server";

export async function PATCH(
  req: Request,
  // 🔥 FIX: Next.js 15+ mein params ek Promise hota hai
  props: { params: Promise<{ id: string }> } 
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title } = await req.json();
    
    // 🔥 FIX: Params ko await karke nikalna padega
    const params = await props.params;
    const roomId = params.id;

    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    await connectToDatabase();

    const updatedWorkspace = await Workspace.findOneAndUpdate(
      { roomId, ownerId: user.id }, 
      { title },
      { new: true }
    );

    if (!updatedWorkspace) {
      return new NextResponse("Workspace not found", { status: 404 });
    }

    return NextResponse.json(updatedWorkspace);
  } catch (error) {
    console.error("Error updating workspace:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  // 🔥 FIX: Same fix applied to DELETE route
  props: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 🔥 FIX: Params ko await karke nikalna padega
    const params = await props.params;
    const roomId = params.id;

    await connectToDatabase();

    const deletedWorkspace = await Workspace.findOneAndDelete({
      roomId: roomId,
      ownerId: user.id, 
    });

    if (!deletedWorkspace) {
      return new NextResponse("Workspace not found", { status: 404 });
    }

    return new NextResponse("Workspace deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting workspace:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}