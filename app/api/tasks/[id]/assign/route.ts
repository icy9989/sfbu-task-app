import { NextRequest, NextResponse } from "next/server";
import prismadb from '@/lib/prismadb';
import serverAuth from "@/lib/server-auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { assignedTo } = await req.json();
    const { currentUser } = await serverAuth();
    if (!currentUser) return new NextResponse("Unauthenticated", { status: 401 });

    // Check if task exists
    const task = await prismadb.task.findUnique({
      where: { id: params.id },
    });

    if (!task) return new NextResponse("Task not found", { status: 404 });

    // Check if user exists
    const user = await prismadb.user.findUnique({
      where: { id: assignedTo },
    });

    if (!user) return new NextResponse("User not found", { status: 404 });

    // Assign task to user
    const assignedTask = await prismadb.assignmentTasks.create({
      data: {
        taskId: task.id,
        assignedBy: currentUser.id,
        assignedTo: user.id,
      },
    });

    return NextResponse.json(assignedTask);
  } catch (error) {
    console.log("[TASK_ASSIGN]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
