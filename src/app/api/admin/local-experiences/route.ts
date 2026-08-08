import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import "@/models";
import LocalExperience from "@/models/LocalExperience";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET: List all local experiences (including inactive)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const experiences = await LocalExperience.find({}).sort({ createdAt: -1 });

    return NextResponse.json(experiences);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch local experiences" },
      { status: 500 }
    );
  }
}

// POST: Create a new local experience
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

    const existing = await LocalExperience.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 400 }
      );
    }

    const experience = await LocalExperience.create(body);

    return NextResponse.json(experience, { status: 201 });
  } catch (error: any) {
    console.error("Create Local Experience Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create local experience" },
      { status: 500 }
    );
  }
}
