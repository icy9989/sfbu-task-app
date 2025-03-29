import { NextRequest, NextResponse } from "next/server";
import prismadb from '@/lib/prismadb';
import serverAuth from "@/lib/server-auth";

// POST /api/teams → Create a new team
export async function POST(req: Request) {
  try {
    const { name, description } = await req.json();
    const { currentUser } = await serverAuth();

    if (!name) return new NextResponse("Team name is required", { status: 400 });
    
    // Create the team and associate it with the creator (admin)
    const team = await prismadb.team.create({
      data: {
        name,
        description,
        adminId: currentUser.id,
      },
    });

    // Add the creator as the first member (admin)
    await prismadb.teamMembers.create({
      data: {
        teamId: team.id,
        userId: currentUser.id,
        role: "ADMIN", // The user is the team admin by default
      },
    });

    return NextResponse.json(team);
  } catch (error) {
    console.log("[TEAM_CREATE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// GET /api/teams → List all teams
export async function GET(req: NextRequest) {
  try {
    const { currentUser } = await serverAuth();

    if (!currentUser) return new NextResponse("Unauthenticated", { status: 401 });

    // Find all teams where the current user is a member or the creator
    const teams = await prismadb.team.findMany({
      where: {
        OR: [
          { adminId: currentUser.id },  // Created teams
          { members: { some: { userId: currentUser.id } } },  // Teams the user is part of
        ],
      },
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.log("[TEAMS_LIST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

