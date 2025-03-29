import { NextResponse } from "next/server";
import prismadb from '@/lib/prismadb';
import serverAuth from "@/lib/server-auth";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    // Ensure there's a current user after authentication
    const { currentUser } = await serverAuth();

    // If no user is authenticated, respond with Unauthorized
    if (!currentUser) return new NextResponse("Unauthenticated", { status: 401 });

    // Ensure the comment ID exists and is valid
    const comment = await prismadb.comment.findUnique({
      where: {
        id: params.id,
      },
    });

    // If comment is not found, respond with a 404
    if (!comment) return new NextResponse("Comment not found", { status: 404 });

    // Check if the current user is authorized to delete the comment
    if (comment.userId !== currentUser.id) {
      return new NextResponse("Forbidden: You are not allowed to delete this comment", { status: 403 });
    }

    // Proceed to delete the comment from the database
    await prismadb.comment.delete({
      where: {
        id: params.id,
      },
    });

    // Send a success response
    return new NextResponse("Comment deleted successfully", { status: 200 });

  } catch (error) {
    // Log the error for debugging
    console.error("[COMMENT_DELETE_ERROR]", error);

    // Return a generic 500 error if something goes wrong
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
