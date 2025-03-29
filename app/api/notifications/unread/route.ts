import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import serverAuth from "@/lib/server-auth";

export async function GET() {
  try {
    const { currentUser } = await serverAuth();
    if (!currentUser) return new NextResponse("Unauthenticated", { status: 401 });

    // Fetch unread notifications for the current user
    const unreadNotifications = await prismadb.notification.findMany({
      where: {
        userId: currentUser.id,
        isRead: false,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(unreadNotifications);
  } catch (error) {
    console.log("[UNREAD_NOTIFICATIONS_RETRIEVE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
