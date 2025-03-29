import { NextRequest, NextResponse } from "next/server";
import prismadb from '@/lib/prismadb';

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
    try {
        // Validate the userId parameter
        if (!params.userId) {
            return new NextResponse("User ID is required", { status: 400 });
        }

        // Fetch projects related to the user, either as a creator or a team member
        const projects = await prismadb.project.findMany({
            where: {
                // Find projects where the user is the creator or a member of the team
                team: {
                    members: {
                        some: {
                            userId: params.userId, // The user must be a member of the team
                        },
                    },
                },
            },
            include: {
                tasks: true, // Include tasks related to the project
                team: true,  // Include team information (optional)
            },
        });

        // Prepare project data with task completion info
        const projectData = projects.map(project => {
            // Get total and completed task counts
            const totalTasks = project.tasks.length;
            const completedTasks = project.tasks.filter(t => t.status === "Completed").length;
            const completionRate = totalTasks
                ? (completedTasks / totalTasks) * 100
                : 0;

            return {
                projectName: project.name,
                totalTasks,
                completedTasks,
                completionRate,
            };
        });

        return NextResponse.json(projectData);
    } catch (error) {
        console.error("[FETCH_PROJECT_COMPLETION]", error);
        return new NextResponse("Failed to fetch project data", { status: 500 });
    }
}
