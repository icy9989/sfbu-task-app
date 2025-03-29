import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import serverAuth from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  try {
    // Fetch notifications for the current user
    const notifications = {
        data: "Hello from vercel app"
    }

    return NextResponse.json(notifications);
  } catch (error) {
    console.log("[TEST_VERCEL_RETRIEVE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
