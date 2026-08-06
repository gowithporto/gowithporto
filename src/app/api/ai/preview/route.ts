import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import AIResponse from "@/models/AIResponse";
import User from "@/models/User";
import { generateAIResponse } from "@/services/ai";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ ALWAYS parse body
    const body = await req.json();
    const { days, budget, people, dates } = body;

    await connectDB();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 🔐 LOCK RULE
    if (user.freeUsed && user.credits <= 0) {
      return NextResponse.json({
        locked: true,
        message: "Payment required",
      });
    }

    // 🔮 REAL AI RESPONSE (Gemini) — generate before charging, so a failed
    // generation never consumes the user's free try or a paid credit
    const aiResponse = await generateAIResponse({
      systemPrompt:
        "You are a travel assistant for Porto. Generate a structured, helpful itinerary.",
      userInput: {
        days,
        budget,
        people,
      },
    });

    // 🎁 FREE OR CREDIT — only charge once generation succeeded
    if (!user.freeUsed) {
      user.freeUsed = true;
    } else {
      user.credits -= 1;
    }
    await user.save();

    // ✅ SAVE AI RESPONSE
    const savedResponse = await AIResponse.create({
      userEmail: session.user.email,
      prompt: { days, budget, people, dates },
      response: aiResponse,
    });

    // ✅ ALWAYS return JSON
    return NextResponse.json({
      locked: false,
      id: savedResponse._id,
      response: aiResponse,
      remainingCredits: user.credits,
    });
  } catch (error) {
    console.error("AI preview error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
