import { NextResponse } from "next/server";
import prismadb from '@/lib/prismadb';
import serverAuth from "@/lib/server-auth";

// DELETE /api/teams/{id}/members/{userId} → Remove a team member
export async function DELETE(req: Request, { params }: { params: { id: string, userId: string } }) {
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
    if (team.adminId !== currentUser.id) return new NextResponse("Forbidden: Only the admin can remove members", { status: 403 });

    // Remove the user from the team
    await prismadb.teamMembers.delete({
      where: {
        teamId_userId: {
          teamId: team.id,
          userId: params.userId,
        },
      },
    });

    return new NextResponse("Member removed successfully", { status: 200 });
  } catch (error) {
    console.log("[REMOVE_TEAM_MEMBER]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
