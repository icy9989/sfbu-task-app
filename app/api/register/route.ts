import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import prismadb from '@/lib/prismadb';
import serverAuth from "@/lib/server-auth";

export async function POST(req: Request) { 
    try {
        const { name, email, password } = await req.json();   
        
        // Validate input fields
        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        if (!email) {
            return new NextResponse("Email is required", { status: 400 }); // Corrected error message from "Username is required"
        }

        if (!password) {
            return new NextResponse("Password is required", { status: 400 });
        }

        // Check if the user already exists
        const existingUser = await prismadb.user.findUnique({
            where: {
                email
            }
        });

        if (existingUser) {
            return new NextResponse("Email already exists!", { status: 422 }); // Changed from "Username already existed!"
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create the user in the database
        const user = await prismadb.user.create({
            data: {
                name,
                email,
                hashedPassword
            }
        });

        // Create DashboardStats for the new user
        await prismadb.dashboardStats.create({
            data: {
                userId: user.id, // Linking the stats to the newly created user
                totalTasks: 0,   // You can set default values here
                completedTasks: 0,
                overdueTasks: 0,
                completionRate: 0.0,
                activeProjects: 0,
            }
        });

        // Return the created user along with status 200
        return NextResponse.json(user);
        
    } catch (error) {
        console.log("[USER_REGISTER]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function GET() { 
    try {
      
        const { currentUser } = await serverAuth();
 
        const user = await prismadb.user.findUnique({
            where: {
                id: currentUser.id
            }
        })

        return NextResponse.json(user);
        
    } catch(error) {
        console.log("[USER_GET]", error);
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

export async function PATCH(req: Request) { 
    try {
        const { name, email, password } = await req.json();   
        
        const { currentUser } = await serverAuth();

        let user;

        if(password) {
            const hashedPassword = await bcrypt.hash(password, 12);

            user = await prismadb.user.update({
                where: {
                    id: currentUser.id
                },
                data: {
                    hashedPassword,
                }
            })
        } else {
            user = await prismadb.user.update({
                where: {
                    id: currentUser.id
                },
                data: {
                    name,
                    email
                }
            })
        }

        return NextResponse.json(user);
        
    } catch(error) {
        console.log("[USER_UPDATE]", error);
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}