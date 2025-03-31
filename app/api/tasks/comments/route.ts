import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

// Add a comment to a task
export async function POST(req: NextRequest) {
    try {
        // Parse request body
        const { taskId, userId, comment } = await req.json();

        // Validate the request data
        if (!taskId || !userId || !comment) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Save the comment to the database
        const newComment = await prismadb.comment.create({
            data: {
                taskId,
                userId,
                comment, // Match with schema
                timestamp: new Date(),
            },
        });

        // Return success response
        return NextResponse.json({
            message: "Comment added successfully",
            comment: newComment,
        });
    } catch (error) {
        console.error("[COMMENT_ADD_ERROR]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
