import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import AIResponse from "@/models/AIResponse";
import User from "@/models/User";
import { generateAIResponse } from "@/services/ai";
import { AIIncompleteItineraryError, AIRateLimitError } from "@/services/ai/aiProvider";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Burst guard — independent of the credit system below, this just caps
    // how fast one account can hammer the (paid, slow) AI provider.
    const ip = getClientIp(req.headers);
    if (!checkRateLimit(`ai-preview:${session.user.email}`) || !checkRateLimit(`ai-preview:${ip}`)) {
      return NextResponse.json(
        { error: "You're generating trip plans too quickly — please slow down and try again shortly." },
        { status: 429 },
      );
    }

    // ✅ ALWAYS parse body
    const body = await req.json();
    const { days, budget, people, dates, travelStyles, interests } = body;

    await connectDB();

    // 🔐 ATOMIC CLAIM — check-and-spend the free try or a credit in a single
    // DB update, instead of reading the balance, calling the (slow, paid) AI
    // provider, and only then saving the deduction. That old order left a gap
    // where two near-simultaneous requests could both read the same
    // pre-deduction balance and both pass the check — this update lets
    // MongoDB evaluate the condition and the write atomically, so only one
    // concurrent request per available credit can ever win the claim.
    const preClaim = await User.findOneAndUpdate(
      {
        email: session.user.email,
        $or: [{ freeUsed: { $ne: true } }, { credits: { $gt: 0 } }],
      },
      [
        {
          $set: {
            credits: {
              $cond: [{ $eq: ["$freeUsed", true] }, { $subtract: ["$credits", 1] }, "$credits"],
            },
            freeUsed: true,
          },
        },
      ],
      { updatePipeline: true },
    );

    if (!preClaim) {
      const exists = await User.exists({ email: session.user.email });
      if (!exists) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      return NextResponse.json({
        locked: true,
        message: "Payment required",
      });
    }

    // preClaim is the document as it was *before* the update above, so this
    // reflects which branch the claim took and what the balance was pre-spend.
    const usedFreeTry = !preClaim.freeUsed;

    let aiResponse;
    try {
      // 🔮 REAL AI RESPONSE (Groq)
      aiResponse = await generateAIResponse({
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
    } catch (err) {
      // Generation failed — refund exactly what was claimed so the user isn't charged.
      await User.updateOne(
        { email: session.user.email },
        usedFreeTry ? { $set: { freeUsed: false } } : { $inc: { credits: 1 } },
      );
      throw err;
    }

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
      remainingCredits: usedFreeTry ? preClaim.credits : preClaim.credits - 1,
    });
  } catch (error) {
    if (error instanceof AIRateLimitError) {
      console.warn("AI preview rate limited:", error.message);
      return NextResponse.json(
        { error: "We're experiencing high demand right now — please try again in a moment." },
        { status: 429 }
      );
    }

    if (error instanceof AIIncompleteItineraryError) {
      console.error("AI preview incomplete itinerary:", error.message);
      return NextResponse.json(
        {
          error:
            "We couldn't build a complete itinerary for that trip length — please try again. You haven't been charged.",
        },
        { status: 502 }
      );
    }

    console.error("AI preview error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
