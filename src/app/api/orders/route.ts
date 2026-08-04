import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json([], { status: 200 });
  }

  await connectDB();

  const orders = await Order.find({
    userEmail: session.user.email,
  }).sort({ createdAt: -1 });

  return NextResponse.json(orders);
}
