import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(request: NextRequest, { params }: { params: { taskId: string } }) {
    try {
        const { taskId } = await params; //
        // Correct way to access params
        const comments = await prismadb.comment.findMany({    
            where: { taskId },       
            orderBy: { timestamp: "asc" }, // Order by timestamp to get comments in chronological order
            include: {
                user: {
                    select: { id: true, name: true }, // Select relevant user fields
                },
            },
        });

        return NextResponse.json(comments);
    } catch {
        return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
    }
}
