import { connectDB } from "@/lib/mongodb";
import "@/models";
import LocalExperience from "@/models/LocalExperience";
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

    const experiences = await LocalExperience.find(filter).sort({
      order: 1,
      title: 1,
    });

    return NextResponse.json(experiences);
  } catch (err) {
    console.error("LOCAL EXPERIENCES API ERROR:", err);
    return NextResponse.json([], { status: 500 });
  }
}
