import { NextRequest, NextResponse } from "next/server";
import prismadb from '@/lib/prismadb';
import serverAuth from "@/lib/server-auth";

// Get a specific task by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { currentUser } = await serverAuth();
        if (!currentUser) return new NextResponse("Unauthenticated", { status: 401 });

        if (!params.id) return new NextResponse("Task ID is required", { status: 400 });

        const task = await prismadb.task.findUnique({
            where: { id: params.id }
        });

        if (!task) return new NextResponse("Task not found", { status: 404 });

        return NextResponse.json(task);
    } catch (error) {
        console.log("[TASK_RETRIEVE]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// Update Task
export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const { title, description, startDate, dueDate, priority, category, status } = await req.json();

        if (!params.id) return new NextResponse("Task ID is required", { status: 400 });

        const { currentUser } = await serverAuth();
        if (!currentUser) return new NextResponse("Unauthenticated", { status: 401 });

        const task = await prismadb.task.update({
            where: { id: params.id },
            data: { title, description, startDate: new Date(startDate), dueDate: new Date(dueDate), priority, category, status }
        });

        return NextResponse.json(task);
    } catch (error) {
        console.log("[TASK_UPDATE]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// Delete Task
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        if (!params.id) return new NextResponse("Task ID is required", { status: 400 });

        const { currentUser } = await serverAuth();
        if (!currentUser) return new NextResponse("Unauthenticated", { status: 401 });

        await prismadb.task.delete({ where: { id: params.id } });

        return new NextResponse("Task deleted successfully", { status: 200 });
    } catch (error) {
        console.log("[TASK_DELETE]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
