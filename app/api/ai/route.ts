import { NextResponse } from "next/server";
export async function GET() {
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
