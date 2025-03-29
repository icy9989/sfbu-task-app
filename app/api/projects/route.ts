import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import serverAuth from "@/lib/server-auth";

// Create a new project
export async function POST(req: Request) {
  try {
    const { name, teamId } = await req.json();

    // Validation checks
    if (!name) return new NextResponse("Name is required", { status: 400 });
    if (!teamId) return new NextResponse("Team ID is required", { status: 400 });

    const { currentUser } = await serverAuth();
    if (!currentUser) return new NextResponse("Unauthenticated", { status: 401 });

    // Create the project in the database
    const project = await prismadb.project.create({
      data: {
        name,
        teamId,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.log("[PROJECT_CREATE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
\
// Get all projects for a team
export async function GET(req: Request) {
    try {
      const { currentUser } = await serverAuth();
      if (!currentUser) return new NextResponse("Unauthenticated", { status: 401 });
  
      // Retrieve all projects associated with the team
      const projects = await prismadb.project.findMany({
        where: { teamId: currentUser.teamId }, // Assuming currentUser has teamId
        orderBy: { createdAt: "desc" },
      });
  
      return NextResponse.json(projects);
    } catch (error) {
      console.log("[PROJECTS_RETRIEVE]", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  }