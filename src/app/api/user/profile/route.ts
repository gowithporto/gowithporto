import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, image } = await req.json();

  const update: { name?: string; image?: string } = {};
  if (typeof name === "string" && name.trim()) update.name = name.trim();
  if (typeof image === "string" && image.trim()) update.image = image.trim();

  await connectDB();

  const user = await User.findOneAndUpdate(
    { email: session.user.email },
    update,
    { new: true }
  );

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ name: user.name, image: user.image });
}
