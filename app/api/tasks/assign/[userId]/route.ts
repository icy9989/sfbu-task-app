import { NextRequest, NextResponse } from "next/server";
import prismadb from '@/lib/prismadb';

// Get all tasks assigned to a User
export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
    try {
        // Validate that the userId parameter is provided
        if (!params.userId) {
            return new NextResponse("User ID is required", { status: 400 });
        }

        // Fetch tasks assigned to the particular user through the AssignmentTasks model
        const tasks = await prismadb.task.findMany({
            where: {
                assignedTasks: {
                    some: { assignedTo: params.userId }, // Filter for tasks where the user is assigned
                },
            },
            select: {
                id: true, // Selecting task ID
                title: true, // Selecting task title
                category: true, // Selecting task category
                startDate: true, // Selecting task start date
                dueDate: true, // Selecting task due date
                assignedTasks: {
                    where: {
                        assignedTo: params.userId, // Ensuring we only fetch assignments for the specific user
                    },
                    select: {
                        assignedBy: true, // Who assigned the task
                        assignedTo: true, // Who the task is assigned to
                        createdAt: true, // When the assignment was created
                        assignedToUser: {
                            select: {
                                name: true, // Including the name of the user assigned to the task
                            },
                        },
                    },
                },
            },
        });

        // Return the fetched tasks as JSON response
        return NextResponse.json(tasks);
    } catch (error) {
        console.log("[TASKS_ASSIGNED_RETRIEVE]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
