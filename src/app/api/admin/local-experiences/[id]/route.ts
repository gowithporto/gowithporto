import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import "@/models";
import LocalExperience from "@/models/LocalExperience";
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

    const experience = await LocalExperience.findById(id);
    if (!experience) {
      return NextResponse.json({ error: "Experience not found" }, { status: 404 });
    }

    return NextResponse.json(experience);
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

    const experience = await LocalExperience.findById(id);
    if (!experience) {
      return NextResponse.json({ error: "Experience not found" }, { status: 404 });
    }

    if (body.slug && body.slug !== experience.slug) {
      const exists = await LocalExperience.findOne({ slug: body.slug });
      if (exists) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
      }
    }

    Object.assign(experience, body);
    await experience.save();

    return NextResponse.json(experience);
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

    const experience = await LocalExperience.findByIdAndDelete(id);
    if (!experience) {
      return NextResponse.json({ error: "Experience not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Experience deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
