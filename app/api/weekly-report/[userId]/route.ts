import { NextRequest, NextResponse } from "next/server";
import prismadb from '@/lib/prismadb';

// Get weekly report for a user
export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
    try {

        if (!params.userId) {
            return new NextResponse("User ID is required", { status: 400 });
        }

        // Fetch tasks for the user in the current week
        const currentDate = new Date();
        const weekStart = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay())); // Sunday of current week
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6); // Saturday of current week

        const tasks = await prismadb.task.findMany({
            where: {
                creatorId: params.userId as string,
                createdAt: {
                    gte: weekStart,
                    lte: weekEnd
                }
            }
        });

        return NextResponse.json({
            user: params.userId,
            week: `2024-W12`, // This could be dynamically calculated based on currentDate
            tasks: tasks.map(task => ({
                title: task.title,
                status: task.status,
                completionDate: task.status === 'Completed' ? task.updatedAt : null,
                progress: task.status === 'Completed' ? 100 : task.progress
            }))
        });
    } catch (error) {
        console.log("[TASK_WEEKLY_REPORT]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
