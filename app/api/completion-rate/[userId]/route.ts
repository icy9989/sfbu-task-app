import { NextRequest, NextResponse } from "next/server";
import prismadb from '@/lib/prismadb';
import serverAuth from "@/lib/server-auth";

// Get Task Completion Rate with Dynamic Route
export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
    try {
        const { userId } = params;  // Correctly access the dynamic params

        if (!userId) {
            return new NextResponse("User ID is required", { status: 400 });
        }

        // Ensure the user is authenticated
        const { currentUser } = await serverAuth();
        if (!currentUser) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        // Fetch the total and completed tasks for the user
        const totalTasks = await prismadb.task.count({
            where: { creatorId: userId }
        });

        const completedTasks = await prismadb.task.count({
            where: { creatorId: userId, status: 'Completed' }
        });

        // Calculate the completion rate
        const completionRate = totalTasks > 0
            ? ((completedTasks / totalTasks) * 100).toFixed(2)
            : '0';

        return NextResponse.json({
            totalTasks,
            completedTasks,
            completionRate: `${completionRate}%`
        });
    } catch (error) {
        console.log("[TASK_COMPLETION_RATE]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
