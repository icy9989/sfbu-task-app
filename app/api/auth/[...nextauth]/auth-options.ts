import { compare } from "bcrypt";
import { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import prismadb from '@/lib/prismadb';

export const authOptions: NextAuthOptions = {
    providers: [
        Credentials({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                // username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if(!credentials?.email || !credentials?.password) {
                    throw new Error("Credentials are required!");
                }
    
                const user = await prismadb.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                })
    
                if(!user || !user.hashedPassword) {
                    throw new Error("Username does not existed!")
                }
    
                const isCorrectPassword = await compare(credentials.password, user.hashedPassword)
    
                if(!isCorrectPassword) {
                    throw new Error("Password is not correct!");
                }
    
                return user;
            }
        })
    ],
    callbacks: {
        jwt({ token, account, user }) {
          if (account) {
            token.accessToken = account.access_token
            token.id = user?.id
          }
          return token
        },
        session({ session, token }) {
            session.user.id = token.id;
            
            return session;
          },
    },
    pages: {
        signIn: '/login',
    },
    adapter: PrismaAdapter(prismadb),
    debug: process.env.NODE_ENV === 'development',
    session: { strategy: 'jwt' },
    jwt: {
        secret: process.env.NEXTAUTH_JWT_SECRET,
    },
    secret: process.env.NEXTAUTH_SECRET
}
