import { NextResponse } from "next/server";

import prismadb from '@/lib/prismadb';
import serverAuth from "@/lib/server-auth";

// GET /api/users/profile
export async function GET() {
    try {
      const { currentUser } = await serverAuth();  // Authentication middleware
  
      // Fetch the current user's details from the database
      const user = await prismadb.user.findUnique({
        where: {
          id: currentUser.id
        },
        include: {
            teams: {
                include: {
                  team: true, // Include team details for the teams the user is part of
                //   role: true  // Include the role the user has in each team
                }
              },
          notifications: true,
          dashboardStats: true
        }
      });
  
      return NextResponse.json(user);
    } catch (error) {
      console.log("[USER_GET_PROFILE]", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  }
  