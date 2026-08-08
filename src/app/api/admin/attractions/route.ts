import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import "@/models";
import Attraction from "@/models/Attraction";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET: List all attractions (including inactive)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const attractions = await Attraction.find({}).sort({ createdAt: -1 });

    return NextResponse.json(attractions);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch attractions" },
      { status: 500 }
    );
  }
}

// POST: Create a new attraction
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, slug } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { error: "Title and slug are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await Attraction.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 400 }
      );
    }

    const attraction = await Attraction.create(body);

    return NextResponse.json(attraction, { status: 201 });
  } catch (error: any) {
    console.error("Create Attraction Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create attraction" },
      { status: 500 }
    );
  }
}
