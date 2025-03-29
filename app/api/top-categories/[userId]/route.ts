import { NextRequest, NextResponse } from "next/server";
import prismadb from '@/lib/prismadb';
import serverAuth from "@/lib/server-auth";
// Get Most Frequent Task Categories
export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
    try {

        if (!params.userId) {
            return new NextResponse("User ID is required", { status: 400 });
        }

        // Ensure the user is authenticated
        const { currentUser } = await serverAuth();
        if (!currentUser) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        // Fetch tasks for the user and group by category to calculate frequencies
        const tasks = await prismadb.task.findMany({
            where: { creatorId: params.userId as string },
            select: { category: true },
        });

        // Count tasks per category
        const categoryCounts = tasks.reduce((acc, task) => {
            const category = task.category;
            acc[category] = acc[category] ? acc[category] + 1 : 1;
            return acc;
        }, {} as { [key: string]: number });

        // Convert the counts into an array of objects
        const topCategories = Object.entries(categoryCounts)
            .map(([category, taskCount]) => ({ category, taskCount }))
            .sort((a, b) => b.taskCount - a.taskCount); // Sort by task count in descending order

        return NextResponse.json({ topCategories });
    } catch (error) {
        console.log("[TASK_TOP_CATEGORIES]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
