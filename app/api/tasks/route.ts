import { NextRequest, NextResponse } from "next/server";
import prismadb from '@/lib/prismadb';
import serverAuth from "@/lib/server-auth";

// Create Task
export async function POST(req: NextRequest) {
  try {
    const { title, description, startDate, dueDate, priority, category, status, teamId, projectId, assignedTo } = await req.json();

    // Validation checks
    if (!title) return new NextResponse("Title is required", { status: 400 });
    if (!startDate) return new NextResponse("Start Date is required", { status: 400 });
    if (!dueDate) return new NextResponse("Due Date is required", { status: 400 });
    if (!priority) return new NextResponse("Priority is required", { status: 400 });
    if (!category) return new NextResponse("Category is required", { status: 400 });
    if (!status) return new NextResponse("Status is required", { status: 400 });

    // Authenticate user
    const { currentUser } = await serverAuth();
    if (!currentUser) return new NextResponse("Unauthenticated", { status: 401 });

    // Ensure the user is part of the team (optional security measure)
    if (teamId) {
      const userTeamMember = await prismadb.teamMembers.findFirst({
        where: {
          userId: currentUser.id,
          teamId: teamId
        }
      });

      if (!userTeamMember) {
        return new NextResponse("You are not a member of this team", { status: 403 });
      }
    }

    // Create task
    const task = await prismadb.task.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        dueDate: new Date(dueDate),
        priority,
        category,
        status,
        creatorId: currentUser.id,
        // Optional: Team and Project assignments
        teamId: teamId || undefined,  // Use `undefined` if not part of a team
        projectId: projectId || undefined, // Use `undefined` if not part of a project
        // Handle assignment relations if there are any
        assignedTasks: assignedTo && assignedTo.length > 0 ? {
          create: assignedTo.map((userId: string) => ({
            assignedBy: currentUser.id,
            assignedTo: userId
          }))
        } : undefined
      }
    });

    return NextResponse.json(task);
  } catch (error) {
    console.log("[TASK_CREATE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Get all tasks for the current user (either created or assigned)
export async function GET() {
    try {
        const { currentUser } = await serverAuth();
        if (!currentUser) return new NextResponse("Unauthenticated", { status: 401 });

        // Get tasks where the user is the creator or assigned to them
        const tasks = await prismadb.task.findMany({
            where: {
                OR: [
                    { creatorId: currentUser.id }, // Tasks created by the user
                    {
                        assignedTasks: {
                            some: {
                                assignedTo: currentUser.id // Tasks assigned to the user
                            }
                        }
                    }
                ]
            },
            orderBy: { createdAt: "desc" },
            include: {
                assignedTasks: {
                    include: {
                        assignedToUser: true // Include the assigned user information
                    }
                },
                team: true // Include team details
            }
        });

        return NextResponse.json(tasks);
    } catch (error) {
        console.log("[TASKS_RETRIEVE]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
