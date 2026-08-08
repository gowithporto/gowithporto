import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import "@/models";
import BikeRentalProvider from "@/models/BikeRentalProvider";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET: List all bike rental providers (including inactive)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const providers = await BikeRentalProvider.find({}).sort({
      createdAt: -1,
    });

    return NextResponse.json(providers);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch bike rental providers" },
      { status: 500 }
    );
  }
}

// POST: Create a new bike rental provider
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, coverImage, googleMapsUrl } = body;

    if (!name || !coverImage || !googleMapsUrl) {
      return NextResponse.json(
        { error: "Name, cover image and Google Maps link are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const provider = await BikeRentalProvider.create(body);

    return NextResponse.json(provider, { status: 201 });
  } catch (error: any) {
    console.error("Create Bike Rental Provider Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create bike rental provider" },
      { status: 500 }
    );
  }
}
