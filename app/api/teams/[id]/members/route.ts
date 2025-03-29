import { NextRequest, NextResponse } from "next/server";
import prismadb from '@/lib/prismadb';
import serverAuth from "@/lib/server-auth";

// POST /api/teams/{id}/members → Add team members
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId, role } = await req.json();
    const { currentUser } = await serverAuth();

    if (!currentUser) return new NextResponse("Unauthenticated", { status: 401 });

    // Find the team to check if the current user is the admin
    const team = await prismadb.team.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!team) return new NextResponse("Team not found", { status: 404 });
    if (team.adminId !== currentUser.id) return new NextResponse("Forbidden: Only the admin can add members", { status: 403 });

    // Add the user to the team as a member
    const addedMember = await prismadb.teamMembers.create({
      data: {
        teamId: team.id,
        userId,
        role: role || "MEMBER",  // Default role is MEMBER if not provided
      },
    });

    return NextResponse.json(addedMember);
  } catch (error) {
    console.log("[ADD_TEAM_MEMBER]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
