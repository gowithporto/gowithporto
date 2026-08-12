import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Attraction from "@/models/Attraction";
import BikeRentalProvider from "@/models/BikeRentalProvider";
import Favorite from "@/models/Favorite";
import LocalExperience from "@/models/LocalExperience";
import Product from "@/models/Product";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const MODELS: Record<string, any> = {
  product: Product,
  attraction: Attraction,
  localExperience: LocalExperience,
  bikeRental: BikeRentalProvider,
};

function buildCard(itemType: string, doc: any) {
  switch (itemType) {
    case "product":
      return {
        itemType,
        itemId: String(doc._id),
        title: doc.title,
        image: doc.images?.[0] || doc.variants?.[0]?.image,
        subtitle: doc.category,
        price: doc.price,
        href: `/shop/${doc.slug}`,
      };
    case "attraction":
      return {
        itemType,
        itemId: String(doc._id),
        title: doc.title,
        image: doc.gallery?.[0] || doc.coverImage,
        subtitle: doc.area,
        href: `/attractions/${doc.slug}`,
      };
    case "localExperience":
      return {
        itemType,
        itemId: String(doc._id),
        title: doc.title,
        image: doc.gallery?.[0] || doc.coverImage,
        subtitle: doc.area,
        price: doc.price,
        href: `/local-experiences/${doc.slug}`,
      };
    case "bikeRental":
      return {
        itemType,
        itemId: String(doc._id),
        title: doc.name,
        image: doc.coverImage,
        subtitle: doc.address,
        href: doc.googleMapsUrl,
        external: true,
      };
    default:
      return null;
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const favorites = await Favorite.find({ userEmail: session.user.email }).sort({
    createdAt: -1,
  });

  const idsByType: Record<string, string[]> = {};
  for (const fav of favorites) {
    idsByType[fav.itemType] = idsByType[fav.itemType] || [];
    idsByType[fav.itemType].push(String(fav.itemId));
  }

  const itemsByKey = new Map<string, any>();
  await Promise.all(
    Object.entries(idsByType).map(async ([itemType, ids]) => {
      const Model = MODELS[itemType];
      if (!Model) return;
      const docs = await Model.find({ _id: { $in: ids } });
      for (const doc of docs) {
        itemsByKey.set(`${itemType}:${doc._id}`, doc);
      }
    })
  );

  const result = favorites
    .map((fav) => {
      const doc = itemsByKey.get(`${fav.itemType}:${fav.itemId}`);
      if (!doc) return null;
      return buildCard(fav.itemType, doc);
    })
    .filter(Boolean);

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { itemType, itemId } = await req.json();
  if (!MODELS[itemType] || !itemId) {
    return NextResponse.json({ error: "Invalid favorite" }, { status: 400 });
  }

  await connectDB();

  const existing = await Favorite.findOne({
    userEmail: session.user.email,
    itemType,
    itemId,
  });

  if (existing) {
    await existing.deleteOne();
    return NextResponse.json({ favorited: false });
  }

  await Favorite.create({ userEmail: session.user.email, itemType, itemId });
  return NextResponse.json({ favorited: true });
}
