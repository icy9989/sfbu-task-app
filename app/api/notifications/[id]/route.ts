import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import serverAuth from "@/lib/server-auth";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { currentUser } = await serverAuth();
    if (!currentUser) return new NextResponse("Unauthenticated", { status: 401 });

    // Check if notification exists
    const notification = await prismadb.notification.findUnique({
      where: { id: params.id },
    });

    if (!notification) return new NextResponse("Notification not found", { status: 404 });

    // Check if the notification belongs to the current user
    if (notification.userId !== currentUser.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Delete notification
    await prismadb.notification.delete({
      where: { id: params.id },
    });

    return new NextResponse("Notification deleted successfully", { status: 200 });
  } catch (error) {
    console.log("[NOTIFICATION_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
