import { resolveLocalized } from "@/lib/localizeContent";
import { connectDB } from "@/lib/mongodb";
import LocalExperience from "@/models/LocalExperience";
import { NextRequest, NextResponse } from "next/server";

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  await connectDB();

  const { slug } = await params;
  const lang = req.nextUrl.searchParams.get("lang") || "en";

  const experience = await LocalExperience.findOne({ slug, active: true }).lean();

  if (!experience) {
    return NextResponse.json({ error: "Experience not found" }, { status: 404 });
  }

  return NextResponse.json(resolveLocalized(experience, lang, TRANSLATABLE_FIELDS));
}
