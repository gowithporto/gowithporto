import { connectDB } from "@/lib/mongodb";
import "@/models";
import BikeRentalProvider from "@/models/BikeRentalProvider";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const providers = await BikeRentalProvider.find({ active: true }).sort({
      order: 1,
      name: 1,
    });

    return NextResponse.json(providers);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch bike rental providers" },
      { status: 500 }
    );
  }
}
