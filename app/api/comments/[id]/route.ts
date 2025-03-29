import { NextResponse } from "next/server";
import prismadb from '@/lib/prismadb';
import serverAuth from "@/lib/server-auth";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { currentUser } = await serverAuth();

    if (!currentUser) return new NextResponse("Unauthenticated", { status: 401 });

    const comment = await prismadb.comment.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!comment) return new NextResponse("Comment not found", { status: 404 });
    if (comment.userId !== currentUser.id) return new NextResponse("Forbidden: You are not allowed to delete this comment", { status: 403 });

    await prismadb.comment.delete({
      where: {
        id: params.id,
      },
    });

    return new NextResponse("Comment deleted successfully", { status: 200 });
  } catch (error) {
    console.log("[COMMENT_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}


