import { NextRequest, NextResponse } from "next/server";
import prismadb from '@/lib/prismadb';
import serverAuth from "@/lib/server-auth"; // Assuming this is for user authentication

// Get user dashboard statistics based on userId
export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
    try {
        // Validate userId from params
        if (!params.userId) {
            return new NextResponse("User ID is required", { status: 400 });
        }

        // Fetch the user's dashboard stats
        const stats = await prismadb.dashboardStats.findUnique({
            where: {
                userId: params.userId, // Use the userId from route params
            },
        });

        // Check if stats exist for the user
        if (!stats) {
            return new NextResponse("User stats not found", { status: 404 });
        }

        // Return stats as JSON response
        return NextResponse.json(stats);
    } catch (error) {
        console.error("[FETCH_DASHBOARD_STATS]", error);
        return new NextResponse("Failed to fetch stats", { status: 500 });
    }
}
