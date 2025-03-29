import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

// Get project details by ID
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const project = await prismadb.project.findUnique({
      where: { id: params.id },
      include: { team: true, tasks: true }, // Include team info and tasks
    });

    if (!project) return new NextResponse("Project not found", { status: 404 });

    return NextResponse.json(project);
  } catch (error) {
    console.log("[PROJECT_GET_BY_ID]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Update project details
export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
      const { name } = await req.json();
  
      // Update project in the database
      const project = await prismadb.project.update({
        where: { id: params.id },
        data: { name },
      });
  
      return NextResponse.json(project);
    } catch (error) {
      console.log("[PROJECT_UPDATE]", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  }

  // Delete a project by ID
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
      await prismadb.project.delete({
        where: { id: params.id },
      });
  
      return new NextResponse("Project deleted successfully", { status: 200 });
    } catch (error) {
      console.log("[PROJECT_DELETE]", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  }