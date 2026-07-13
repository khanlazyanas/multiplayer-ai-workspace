import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Workspace from "@/lib/models/workspace.model";
import { currentUser } from "@clerk/nextjs/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title } = await req.json();
    const roomId = params.id;

    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    await connectToDatabase();

    // MongoDB me title update kar rahe hain
    const updatedWorkspace = await Workspace.findOneAndUpdate(
      { roomId, ownerId: user.id }, // Make sure owner hi update kar paye
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
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDatabase();

    // Database se workspace delete kar rahe hain (sirf owner delete kar sakta hai)
    const deletedWorkspace = await Workspace.findOneAndDelete({
      roomId: params.id,
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

