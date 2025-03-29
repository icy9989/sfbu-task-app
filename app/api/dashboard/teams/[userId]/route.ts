import { NextRequest, NextResponse } from "next/server";
import prismadb from '@/lib/prismadb';

// Get team productivity insights based on userId
export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
    try {
        // Validate userId
        if (!params.userId) {
            
            return new NextResponse("User ID is required", { status: 400 });
        }

        // Fetch teams where the user is a member
        const teams = await prismadb.team.findMany({
            where: {
                members: {
                    some: {
                        userId: params.userId, // The user must be a member of the team
                    },
                },
            },
            include: {
                tasks: true,  // Include tasks related to the team
            },
        });

        // Process team insights
        const teamInsights = teams.map(team => {
            const totalTasks = team.tasks.length;
            const completedTasks = team.tasks.filter(t => t.status === "Completed").length;
            const completionRate = totalTasks
                ? (completedTasks / totalTasks) * 100
                : 0;

            return {
                teamName: team.name,
                totalTasks,
                completedTasks,
                completionRate,
            };
        });

        // Return the insights as JSON
        return NextResponse.json(teamInsights);
    } catch (error) {
        console.error("[FETCH_TEAM_INSIGHTS]", error);
        return new NextResponse("Failed to fetch team insights", { status: 500 });
    }
}
