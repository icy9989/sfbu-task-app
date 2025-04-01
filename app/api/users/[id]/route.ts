import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

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

export async function GET(req: Request, { params }: { params: { id: string | string[] } }) {
  try {
    // Ensure `id` is a string, even if `params.id` is an array
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    // If `id` is missing, return an error
    if (!id) {
      return new NextResponse('ID parameter is missing', { status: 400 });
    }

    // Fetch the user data from the database
    const user = await prismadb.user.findUnique({
      where: { id },
      include: {
        teams: { include: { team: true } },
        notifications: true,
        dashboardStats: true,
      },
    });

    // Handle case when user is not found
    if (!user) {
      console.log('User not found:', id);
      return new NextResponse('User not found', { status: 404 });
    }

    // Return the user data if found
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
