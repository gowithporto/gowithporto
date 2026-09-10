import { headers } from "next/headers";

import LocalExperiencesBanner from "@/components/localExperiences/LocalExperiencesBanner";
import LocalExperiencesExplorer from "@/components/localExperiences/LocalExperiencesExplorer";
import LocalExperiencesInfoStrip from "@/components/localExperiences/LocalExperiencesInfoStrip";
import { getAllExperiences } from "@/lib/localExperiences";

export default async function LocalExperiencesPage() {
  const hdrs = await headers();
  const lang = hdrs.get("x-locale") || "en";
  const experiences = await getAllExperiences(lang);

  return (
    <div className="space-y-10 px-4 pt-24 pb-16 sm:px-8 sm:pt-28 lg:px-12">
      <LocalExperiencesBanner />

      <LocalExperiencesExplorer experiences={experiences} />

      <LocalExperiencesInfoStrip />
    </div>
  );
}
