import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import "@/models";
import BikeRentalProvider from "@/models/BikeRentalProvider";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const provider = await BikeRentalProvider.findById(id);
    if (!provider) {
      return NextResponse.json(
        { error: "Bike rental provider not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(provider);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    await connectDB();

    const provider = await BikeRentalProvider.findById(id);
    if (!provider) {
      return NextResponse.json(
        { error: "Bike rental provider not found" },
        { status: 404 }
      );
    }

    Object.assign(provider, body);
    await provider.save();

    return NextResponse.json(provider);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const provider = await BikeRentalProvider.findByIdAndDelete(id);
    if (!provider) {
      return NextResponse.json(
        { error: "Bike rental provider not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Bike rental provider deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
