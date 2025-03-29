import { NextRequest, NextResponse } from "next/server";
import prismadb from '@/lib/prismadb';
import serverAuth from "@/lib/server-auth";

// Get Task Completion Rate 
export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
    try {
        const { userId } = params;  // Correctly access the dynamic params

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        // Ensure the user is authenticated
        const { currentUser } = await serverAuth();
        if (!currentUser) {
            return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
        }

        // Fetch total and completed tasks for the user
        const [totalTasks, completedTasks] = await Promise.all([
            prismadb.task.count({ where: { creatorId: userId } }),
            prismadb.task.count({ where: { creatorId: userId, status: 'Completed' } })
        ]);

        // Calculate the completion rate
        const completionRate = totalTasks > 0
            ? ((completedTasks / totalTasks) * 100).toFixed(2)
            : '0';

        // Return the response with the calculated completion rate
        return NextResponse.json({
            totalTasks,
            completedTasks,
            completionRate: `${completionRate}%`
        });
    } catch (error) {
        console.error("[TASK_COMPLETION_RATE]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
