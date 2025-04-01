import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prismadb from '@/lib/prismadb';
import serverAuth from "@/lib/server-auth";

/**
 * GET /api/users/{id}
 * @swagger
 * /api/users/{id}:
 *   get:
 *     description: Get the details of a user by their unique ID.
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
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal Server Error.
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await prismadb.user.findUnique({
      where: { id: params.id },
      include: {
        teams: { include: { team: true } },
        notifications: true,
        dashboardStats: true,
      },
    });

    if (!user) {
      console.log('User not found:', params.id);
      return new NextResponse('User not found', { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
