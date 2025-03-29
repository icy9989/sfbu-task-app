import { NextResponse, NextRequest } from "next/server";
import prismadb from "@/lib/prismadb";

// Get AI-generated task suggestions
export async function GET(req: NextRequest) {
    try {
      const userId = req.nextUrl.searchParams.get('userId'); // Use get() to access the query param
  
      if (!userId) {
        return new NextResponse("User ID is required", { status: 400 });
      }
  
      const recommendations = await prismadb.recommendation.findMany({ where: { userId } });
      return NextResponse.json(recommendations);
    } catch (error) {
      console.error("[FETCH_RECOMMENDATIONS]", error);
      return new NextResponse("Failed to fetch recommendations", { status: 500 });
    }
  }
  
  // Generate new AI task recommendations
  export async function POST(req: NextRequest) {
    try {
      const { userId, title, category, startDate, dueDate } = await req.json();
  
      if (!userId || !title || !category || !startDate || !dueDate) {
        return new NextResponse("All fields are required", { status: 400 });
      }
  
      const newRecommendation = await prismadb.recommendation.create({
        data: { userId, title, category, startDate, dueDate },
      });
  
      return NextResponse.json({ message: "Recommendation added successfully", recommendation: newRecommendation });
    } catch (error) {
      console.error("[ADD_RECOMMENDATION]", error);
      return new NextResponse("Failed to generate recommendation", { status: 500 });
    }
  }
 