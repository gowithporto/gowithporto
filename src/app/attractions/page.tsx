import { headers } from "next/headers";

import AttractionsBanner from "@/components/attractions/AttractionsBanner";
import AttractionsExplorer from "@/components/attractions/AttractionsExplorer";
import AttractionsInfoStrip from "@/components/attractions/AttractionsInfoStrip";
import { getAllAttractions } from "@/lib/attractions";

export default async function AttractionsPage() {
  const hdrs = await headers();
  const lang = hdrs.get("x-locale") || "en";
  const attractions = await getAllAttractions(lang);

  return (
    <div className="space-y-10 px-4 pt-24 pb-16 sm:px-8 sm:pt-28 lg:px-12">
      <AttractionsBanner />

      <AttractionsExplorer attractions={attractions} />

      <AttractionsInfoStrip />
    </div>
  );
}
