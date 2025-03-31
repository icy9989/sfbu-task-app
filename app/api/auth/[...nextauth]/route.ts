import NextAuth from "next-auth"

import { authOptions } from "./auth-options";


/**
 * @swagger
 * /api/auth/[...nextauth]:
 *   get:
 *     description: Handles authentication callbacks and session management for NextAuth.
 *     responses:
 *       200:
 *         description: Authenticated user session successfully retrieved.
 *       500:
 *         description: Internal Server Error.
 *   post:
 *     description: Handles the sign-in and sign-out requests for NextAuth.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email for signing in.
 *               password:
 *                 type: string
 *                 description: The password for signing in.
 *     responses:
 *       200:
 *         description: User successfully signed in or signed out.
 *       400:
 *         description: Bad Request, invalid data.
 *       500:
 *         description: Internal Server Error.
 */

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }