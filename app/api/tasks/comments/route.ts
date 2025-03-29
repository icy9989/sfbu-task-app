import { NextRequest, NextResponse } from "next/server";
import prismadb from '@/lib/prismadb';

// Add a comment to a task
export async function POST(req: NextRequest) {
    try {
        const { userId, comment, taskId } = await req.json(); // Extract userId and comment from request body

        // Validate the request data
        if (!taskId || !userId || !comment) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Return success message
        return NextResponse.json({
            message: "Comment added successfully",
            taskId: taskId,
        });
    } catch (error) {
        console.log("[COMMENT_ADD_ERROR]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

