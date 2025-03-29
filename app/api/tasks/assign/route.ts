import { NextRequest, NextResponse } from "next/server";
import prismadb from '@/lib/prismadb';
import serverAuth from "@/lib/server-auth";

// Create an assignment for a task
export async function POST(req: NextRequest) {
  try {
    const { taskId, assignedToId } = await req.json(); // Assuming you send taskId and assignedToId in the request body

    // Validate input
    if (!taskId || !assignedToId) {
      return new NextResponse("Task ID and Assigned User ID are required", { status: 400 });
    }

    // Get the current user (the one assigning the task)
    const { currentUser } = await serverAuth();
    if (!currentUser) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    // Create the assignment
    const assignment = await prismadb.assignmentTasks.create({
      data: {
        task: {
          connect: {
            id: taskId, // Connecting the task by ID
          },
        },
        assignedBy: currentUser.id, // The user assigning the task (current authenticated user)
        assignedToUser: {
          connect: {
            id: assignedToId, // The user being assigned the task
          },
        },
      },

      include: {
        assignedToUser: {
          select: {
            name: true, // Fetching the name of the assigned user
          },
        },
        task: {
          select: {
            title: true, // Optionally including the task title in the response
          },
        },
      },
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.log("[TASK_ASSIGN]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
