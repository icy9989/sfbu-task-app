import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import prismadb from '@/lib/prismadb';
import serverAuth from "@/lib/server-auth";

// GET /api/users/{id}
export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
      // Fetch the user by their unique ID, including related data like teams, notifications, and dashboard stats
      const user = await prismadb.user.findUnique({
        where: {
          id: params.id
        },
        include: {
          teams: {
            include: {
              team: true, // Include team details for the teams the user is part of
              role: true  // Include the role the user has in each team
            }
          },
          notifications: true,
          dashboardStats: true
        }
      });
  
      if (!user) {
        return new NextResponse("User not found", { status: 404 });
      }
  
      return NextResponse.json(user);
    } catch (error) {
      console.log("[USER_GET_BY_ID]", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// PUT /api/users/{id}
export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
      const { name, email, password } = await req.json();
      const { currentUser } = await serverAuth();
  
      // Ensure the current user is updating their own profile (optional security measure)
      if (currentUser.id !== params.id) {
        return new NextResponse("Forbidden: You can only update your own profile.", { status: 403 });
      }
  
      let updatedUser;
  
      // If password is provided, hash it
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 12);
        updatedUser = await prismadb.user.update({
          where: { id: currentUser.id },
          data: {
            name,
            email,
            hashedPassword
          }
        });
      } else {
        updatedUser = await prismadb.user.update({
          where: { id: currentUser.id },
          data: {
            name,
            email
          }
        });
      }
  
      return NextResponse.json(updatedUser);
    } catch (error) {
      console.log("[USER_UPDATE]", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// DELETE /api/users/{id}
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
      const { currentUser } = await serverAuth();
  
      // Ensure the current user is authorized to delete the user (either the user themselves or an admin)
      const userInTeams = await prismadb.teamMembers.findMany({
        where: {
          userId: params.id
        }
      });
      
      const isAdmin = userInTeams.some(teamMember => teamMember.role === 'ADMIN');
      
      if (currentUser.id !== params.id && !isAdmin) {
        return new NextResponse("Forbidden: You can only delete your own account or an admin account.", { status: 403 });
      }
  
      // Delete the user from the database
      await prismadb.user.delete({
        where: {
          id: params.id
        }
      });
  
      return new NextResponse("User deleted successfully", { status: 200 });
    } catch (error) {
      console.log("[USER_DELETE]", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
}
