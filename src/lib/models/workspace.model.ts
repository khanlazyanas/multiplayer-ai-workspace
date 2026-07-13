import mongoose, { Schema, Document } from "mongoose";

export interface IWorkspace extends Document {
  roomId: string;
  title: string;
  ownerId: string;
  collaborators: string[];
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceSchema = new Schema(
  {
    roomId: { 
      type: String, 
      required: true, 
      unique: true 
    },
    title: { 
      type: String, 
      required: true, 
      default: "Untitled Workspace" 
    },
    ownerId: { 
      type: String, 
      required: true 
    },
    // Jin doston/users ko access diya gaya hai unki Clerk IDs
    collaborators: [{ 
      type: String 
    }],
  },
  {
    timestamps: true, // Automatically createdAt aur updatedAt manage karega
  }
);

// Next.js ke hot-reloading me model overwrite error se bachne ke liye ye check zaroori hai
const Workspace = mongoose.models.Workspace || mongoose.model<IWorkspace>("Workspace", WorkspaceSchema);

export default Workspace;