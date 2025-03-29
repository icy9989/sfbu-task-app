import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

// Get all tasks for a specific project
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const tasks = await prismadb.task.findMany({
      where: { projectId: params.id }, // Use projectId from the URL parameter
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.log("[PROJECT_TASKS_RETRIEVE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
