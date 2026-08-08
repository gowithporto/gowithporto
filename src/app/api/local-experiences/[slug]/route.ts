import { connectDB } from "@/lib/mongodb";
import LocalExperience from "@/models/LocalExperience";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  await connectDB();

  const { slug } = await params;

  const experience = await LocalExperience.findOne({ slug, active: true });

  if (!experience) {
    return NextResponse.json({ error: "Experience not found" }, { status: 404 });
  }

  return NextResponse.json(experience);
}
