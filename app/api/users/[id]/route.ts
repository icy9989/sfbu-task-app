import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import prismadb from '@/lib/prismadb';
import serverAuth from "@/lib/server-auth";


/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     description: Get the details of a user by their unique ID, including related data like teams, notifications, and dashboard stats.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique ID of the user to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the user details.
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
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal Server Error.
 */

// GET /api/users/{id}
export async function GET(req: Request, { params }: { params: { id: string } }) {
  console.log("Received request for user ID:", params.id);
  
  try {
    const user = await prismadb.user.findUnique({
      where: { id: params.id },
      include: {
        teams: { include: { team: true } },
        notifications: true,
        dashboardStats: true
      }
    });

    if (!user) {
      console.log("User not found:", params.id);
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}


/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     description: Update a user's details by their unique ID. The current user can only update their own profile.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique ID of the user to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new name of the user.
 *               email:
 *                 type: string
 *                 description: The new email of the user.
 *               password:
 *                 type: string
 *                 description: The new password of the user (optional).
 *     responses:
 *       200:
 *         description: User details updated successfully.
 *       403:
 *         description: Forbidden: You can only update your own profile.
 *       400:
 *         description: Bad Request: Invalid or missing fields.
 *       500:
 *         description: Internal Server Error.
 */

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

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     description: Delete a user by their unique ID. A user can delete their own account, or an admin can delete any user's account.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique ID of the user to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *       403:
 *         description: Forbidden: You can only delete your own account or an admin account.
 *       500:
 *         description: Internal Server Error.
 */

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
