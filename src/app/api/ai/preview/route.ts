import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import AIResponse from "@/models/AIResponse";
import User from "@/models/User";
import { generateAIResponse } from "@/services/ai";
import { AIRateLimitError } from "@/services/ai/aiProvider";
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
    const { days, budget, people, dates, travelStyles, interests } = body;

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

    // 🔮 REAL AI RESPONSE (Groq) — generate before charging, so a failed
    // generation never consumes the user's free try or a paid credit
    const aiResponse = await generateAIResponse({
      systemPrompt:
        "You are the lead local trip designer for GoWithPorto, a Porto-based travel platform. " +
        "You have deep, genuine knowledge of the city's neighborhoods, restaurants, viewpoints, and " +
        "seasonal events. Write like an experienced local insider, not a generic tourist guidebook — " +
        "name real, specific places in Porto and Vila Nova de Gaia wherever relevant instead of vague " +
        "descriptions, and keep a warm, professional tone.",
      userInput: {
        days,
        budget,
        people,
        dates,
        travelStyles,
        interests,
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
      prompt: { days, budget, people, dates, travelStyles, interests },
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
    if (error instanceof AIRateLimitError) {
      console.warn("AI preview rate limited:", error.message);
      return NextResponse.json(
        { error: "We're experiencing high demand right now — please try again in a moment." },
        { status: 429 }
      );
    }

    console.error("AI preview error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
