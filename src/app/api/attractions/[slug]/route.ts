import { connectDB } from "@/lib/mongodb";
import Attraction from "@/models/Attraction";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  await connectDB();

  const { slug } = await params;

  const attraction = await Attraction.findOne({ slug, active: true });

  if (!attraction) {
    return NextResponse.json({ error: "Attraction not found" }, { status: 404 });
  }

  return NextResponse.json(attraction);
}
