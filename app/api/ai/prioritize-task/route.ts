import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

// Initialize OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,  
});

export async function POST(req: NextRequest) {
  try {
    const { taskDescription } = await req.json();

    // Validation checks
    if (!taskDescription) {
      return new NextResponse("Task description is required", { status: 400 });
    }

    // Call OpenAI API to prioritize the task
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Or use "gpt-4" if available
      messages: [
        {
          role: "system",
          content:
            "You are a task prioritization assistant. Based on the description, you will determine the urgency and priority of tasks.",
        },
        {
          role: "user",
          content: `Prioritize the following task description: ${taskDescription}`,
        },
      ],
    });

    // Check if 'choices' array exists and is not empty
    if (response.choices && response.choices.length > 0) {
      const result = response.choices[0]?.message?.content?.trim();
      return NextResponse.json({ priority: result });
    } else {
      return new NextResponse("No response received from AI.", { status: 500 });
    }
  } catch (error) {
    // Handle specific OpenAI quota exceeded error
    if (error?.response?.status === 429) {
      console.error("[TASK_PRIORITIZE] Quota exceeded error", error.response);
      return new NextResponse(
        "Quota exceeded. Please check your OpenAI usage and billing.",
        { status: 429 }
      );
    }

    // General error handling
    console.error("[TASK_PRIORITIZE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
