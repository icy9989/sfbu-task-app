import { NextResponse } from "next/server";

import prismadb from '@/lib/prismadb';
import serverAuth from "@/lib/server-auth";

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     description: Get the profile of the currently authenticated user, including their teams, notifications, and dashboard stats.
 *     responses:
 *       200:
 *         description: Successfully retrieved the user profile.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The unique identifier for the user.
 *                 name:
 *                   type: string
 *                   description: The name of the user.
 *                 email:
 *                   type: string
 *                   description: The email of the user.
 *                 teams:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       team:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: The team ID the user is part of.
 *                           name:
 *                             type: string
 *                             description: The name of the team.
 *                       role:
 *                         type: string
 *                         description: The user's role in the team.
 *                 notifications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: The notification ID.
 *                       message:
 *                         type: string
 *                         description: The notification message content.
 *                 dashboardStats:
 *                   type: object
 *                   properties:
 *                     totalTasks:
 *                       type: integer
 *                       description: Total number of tasks assigned to the user.
 *                     completedTasks:
 *                       type: integer
 *                       description: Number of completed tasks.
 *                     overdueTasks:
 *                       type: integer
 *                       description: Number of overdue tasks.
 *                     completionRate:
 *                       type: number
 *                       description: Percentage of completed tasks.
 *                     activeProjects:
 *                       type: integer
 *                       description: Number of active projects for the user.
 *       500:
 *         description: Internal Server Error.
 */

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
  