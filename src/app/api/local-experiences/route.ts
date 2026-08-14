import { resolveLocalized } from "@/lib/localizeContent";
import { connectDB } from "@/lib/mongodb";
import "@/models";
import LocalExperience from "@/models/LocalExperience";
import { NextResponse } from "next/server";

const TRANSLATABLE_FIELDS = [
  "title",
  "shortDescription",
  "story",
  "highlights",
  "included",
  "meetingPoint",
  "groupSize",
  "cancellationPolicy",
] as const;

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const lang = searchParams.get("lang") || "en";

    const filter: any = { active: true };
    if (category) filter.category = category;
    if (featured === "true") filter.featured = true;

    const experiences = await LocalExperience.find(filter)
      .sort({ order: 1, title: 1 })
      .lean();

    const localized = experiences.map((e) => resolveLocalized(e, lang, TRANSLATABLE_FIELDS));

    return NextResponse.json(localized);
  } catch (err) {
    console.error("LOCAL EXPERIENCES API ERROR:", err);
    return NextResponse.json([], { status: 500 });
  }
}
