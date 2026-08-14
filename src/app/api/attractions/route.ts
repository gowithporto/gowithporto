import { resolveLocalized } from "@/lib/localizeContent";
import { connectDB } from "@/lib/mongodb";
import "@/models";
import Attraction from "@/models/Attraction";
import { NextResponse } from "next/server";

const TRANSLATABLE_FIELDS = [
  "title",
  "shortDescription",
  "history",
  "highlights",
  "bestTimeToVisit",
  "openingHours",
  "entryFee",
  "howToGetThere",
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

    const attractions = await Attraction.find(filter)
      .sort({ order: 1, title: 1 })
      .lean();

    const localized = attractions.map((a) => resolveLocalized(a, lang, TRANSLATABLE_FIELDS));

    return NextResponse.json(localized);
  } catch (err) {
    console.error("ATTRACTIONS API ERROR:", err);
    return NextResponse.json([], { status: 500 });
  }
}
