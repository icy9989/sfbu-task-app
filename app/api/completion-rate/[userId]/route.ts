import { NextRequest, NextResponse } from "next/server";
import prismadb from '@/lib/prismadb';
import serverAuth from "@/lib/server-auth";

// Get Task Completion Rate 
export async function GET(req: NextRequest) {
  // Extract the userId from the URL path
  const userId = req.nextUrl.pathname.split("/").pop(); // Extract userId from the URL path

  try {
    // Ensure the userId is provided
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Ensure the user is authenticated
    const { currentUser } = await serverAuth();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // Fetch total and completed tasks for the user using Prisma
    const [totalTasks, completedTasks] = await Promise.all([
      prismadb.task.count({ where: { creatorId: userId } }),
      prismadb.task.count({ where: { creatorId: userId, status: 'Completed' } })
    ]);

    // Calculate the completion rate
    const completionRate = totalTasks > 0
      ? ((completedTasks / totalTasks) * 100).toFixed(2)
      : '0';

    // Return the response with the completion rate
    return NextResponse.json({
      totalTasks,
      completedTasks,
      completionRate: `${completionRate}%`
    });

  } catch (error) {
    // Log and return an error if something goes wrong
    console.error("[TASK_COMPLETION_RATE]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
