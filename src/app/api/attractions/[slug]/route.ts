import { resolveLocalized } from "@/lib/localizeContent";
import { connectDB } from "@/lib/mongodb";
import Attraction from "@/models/Attraction";
import { NextRequest, NextResponse } from "next/server";

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  await connectDB();

  const { slug } = await params;
  const lang = req.nextUrl.searchParams.get("lang") || "en";

  const attraction = await Attraction.findOne({ slug, active: true }).lean();

  if (!attraction) {
    return NextResponse.json({ error: "Attraction not found" }, { status: 404 });
  }

  return NextResponse.json(resolveLocalized(attraction, lang, TRANSLATABLE_FIELDS));
}
