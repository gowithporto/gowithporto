import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Favorite from "@/models/Favorite";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ favorited: false });
  }

  const { searchParams } = new URL(req.url);
  const itemType = searchParams.get("itemType");
  const itemId = searchParams.get("itemId");
  if (!itemType || !itemId) {
    return NextResponse.json({ favorited: false });
  }

  await connectDB();

  const existing = await Favorite.exists({
    userEmail: session.user.email,
    itemType,
    itemId,
  });

  return NextResponse.json({ favorited: !!existing });
}
