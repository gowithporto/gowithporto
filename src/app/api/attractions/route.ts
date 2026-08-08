import { connectDB } from "@/lib/mongodb";
import "@/models";
import Attraction from "@/models/Attraction";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");

    const filter: any = { active: true };
    if (category) filter.category = category;
    if (featured === "true") filter.featured = true;

    const attractions = await Attraction.find(filter).sort({
      order: 1,
      title: 1,
    });

    return NextResponse.json(attractions);
  } catch (err) {
    console.error("ATTRACTIONS API ERROR:", err);
    return NextResponse.json([], { status: 500 });
  }
}
