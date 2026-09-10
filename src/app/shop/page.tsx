import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { headers } from "next/headers";

import CategoryCard from "@/components/shop/CategoryCard";
import ComingSoonNotice from "@/components/shop/ComingSoonNotice";
import InfoStrip from "@/components/shop/InfoStrip";
import ShopAdCard from "@/components/shop/ShopAdCard";
import ShopBanner from "@/components/shop/ShopBanner";
import StoreCard from "@/components/shop/StoreCard";
import Link from "@/components/ui/LocalizedLink";
import { getShopHome } from "@/lib/shop";

export default async function ShopPage() {
  const hdrs = await headers();
  const lang = hdrs.get("x-locale") || "en";
  const { categoryTiles, stores } = await getShopHome(lang);

  return (
    <div className="space-y-10 px-4 pt-24 pb-16 sm:px-8 sm:pt-28 lg:px-12">
      <ComingSoonNotice />
      <ShopBanner />

      {categoryTiles.length === 0 ? (
        <p className="py-16 text-center text-sm text-gray-500">
          No products yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {categoryTiles.map((c) => (
            <CategoryCard
              key={c.slug}
              name={c.name}
              slug={c.slug}
              count={c.count}
              thumbnail={c.image}
            />
          ))}
        </div>
      )}

      {stores.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-medium text-[#1c4c73]">
              Our Shops
            </h2>
            <Link
              href="/stores"
              className="flex items-center gap-1 text-sm font-medium text-[#2c6e9b] hover:underline"
            >
              View All Shops <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stores.slice(0, 4).map((s: any) => (
              <StoreCard
                key={s._id}
                name={s.name}
                slug={s.slug}
                location={s.location}
                tagline={s.tagline}
                logoUrl={s.logoUrl}
                bannerUrl={s.bannerUrl}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-xs">
        <ShopAdCard />
      </div>

      <InfoStrip />
    </div>
  );
}
