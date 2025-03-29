import { NextRequest, NextResponse } from "next/server";
import prismadb from '@/lib/prismadb';

// Add a comment to a task
export async function POST(req: NextRequest, { params }: { params: { taskId: string } }) {
    try {
        const { userId, comment } = await req.json(); // Extract userId and comment from request body

        // Validate the request data
        if (!params.taskId || !userId || !comment) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Create a new comment for the task
        const newComment = await prismadb.comment.create({
            data: {
                taskId: params.taskId as string,
                userId: userId as string,
                comment,
            },
        });

        // Return success message
        return NextResponse.json({
            message: "Comment added successfully",
            taskId: params.taskId,
        });
    } catch (error) {
        console.log("[COMMENT_ADD_ERROR]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}


// Fetch comments for a task
export async function GET(req: NextRequest, { params }: { params: { taskId: string } }) {
    try {
    
        // Validate the taskId
        if (!params.taskId) {
            return new NextResponse("Task ID is required", { status: 400 });
        }

        // Retrieve the comments for the specified task
        const comments = await prismadb.comment.findMany({
            where: { taskId: params.taskId as string },
            orderBy: { timestamp: "asc" }, // Order by timestamp to get comments in chronological order
            include: {
                user: {
                    select: {
                        name: true, // Include the user's name in the response
                    }
                }
            }
        });

        // Format the comments with the user's name and return them
        const formattedComments = comments.map(comment => ({
            user: comment.user.name,
            comment: comment.comment,
            timestamp: comment.timestamp.toISOString(),
        }));

        return NextResponse.json(formattedComments);
    } catch (error) {
        console.log("[TASK_COMMENTS_FETCH]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

