import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import serverAuth from "@/lib/server-auth";

export async function POST(req: NextRequest) {
  try {
    const { message, type, userId } = await req.json();
    const { currentUser } = await serverAuth();
    if (!currentUser) return new NextResponse("Unauthenticated", { status: 401 });

    // Validate request body
    if (!message || !type || !userId) {
      return new NextResponse("Message, type, and userId are required", { status: 400 });
    }

    // Create notification
    const notification = await prismadb.notification.create({
      data: {
        message,
        type,
        userId,
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.log("[NOTIFICATION_CREATE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const { currentUser } = await serverAuth();
    if (!currentUser) return new NextResponse("Unauthenticated", { status: 401 });

    // Fetch notifications for the current user
    const notifications = await prismadb.notification.findMany({
      where: {
        userId: currentUser.id,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.log("[NOTIFICATIONS_RETRIEVE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
