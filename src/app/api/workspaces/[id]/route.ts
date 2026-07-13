import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Workspace from "@/lib/models/workspace.model";
import { currentUser } from "@clerk/nextjs/server";

// PATCH route document ko update karne ke liye hota hai
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