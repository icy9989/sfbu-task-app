import { NextRequest, NextResponse } from "next/server";
import prismadb from '@/lib/prismadb';
import serverAuth from "@/lib/server-auth";

// GET /api/teams/{id} → Get team details
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { currentUser } = await serverAuth();

    if (!currentUser) return new NextResponse("Unauthenticated", { status: 401 });

    // Fetch the team with its members and the team creator (admin)
    const team = await prismadb.team.findUnique({
      where: {
        id: params.id,
      },
      include: {
        admin: true,
        members: true, // Members of the team
      },
    });

    if (!team) {
      return new NextResponse("Team not found", { status: 404 });
    }

    return NextResponse.json(team);
  } catch (error) {
    console.log("[TEAM_GET_BY_ID]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// PUT /api/teams/{id} → Update team details
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { name, description } = await req.json();
    const { currentUser } = await serverAuth();

    if (!currentUser) return new NextResponse("Unauthenticated", { status: 401 });

    // Find the team to check if the current user is the admin
    const team = await prismadb.team.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!team) return new NextResponse("Team not found", { status: 404 });
    if (team.adminId !== currentUser.id) return new NextResponse("Forbidden: You are not the admin of this team", { status: 403 });

    // Update the team
    const updatedTeam = await prismadb.team.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(updatedTeam);
  } catch (error) {
    console.log("[TEAM_UPDATE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE /api/teams/{id} → Delete team
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { currentUser } = await serverAuth();

    if (!currentUser) return new NextResponse("Unauthenticated", { status: 401 });

    // Find the team to check if the current user is the admin
    const team = await prismadb.team.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!team) return new NextResponse("Team not found", { status: 404 });
    if (team.adminId !== currentUser.id) return new NextResponse("Forbidden: You are not the admin of this team", { status: 403 });

    // Delete the team
    await prismadb.team.delete({
      where: {
        id: params.id,
      },
    });

    return new NextResponse("Team deleted successfully", { status: 200 });
  } catch (error) {
    console.log("[TEAM_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
