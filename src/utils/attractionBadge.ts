import {
  BuildingLibraryIcon,
  BuildingOffice2Icon,
  EyeIcon,
  GlobeAltIcon,
  MapIcon,
  StarIcon,
} from "@heroicons/react/24/solid";

export const BADGE_BY_CATEGORY: Record<
  string,
  { label: string; icon: any; classes: string }
> = {
  landmark: { label: "Must See", icon: StarIcon, classes: "bg-white/90 text-[#a9782f]" },
  viewpoint: { label: "Scenic", icon: EyeIcon, classes: "bg-white/90 text-orange-600" },
  church: { label: "Religious", icon: BuildingOffice2Icon, classes: "bg-white/90 text-purple-600" },
  museum: { label: "Cultural", icon: BuildingLibraryIcon, classes: "bg-white/90 text-indigo-600" },
  "historic-street": { label: "Historic", icon: MapIcon, classes: "bg-white/90 text-green-700" },
  bridge: { label: "Historic", icon: MapIcon, classes: "bg-white/90 text-green-700" },
  "garden-park": { label: "Scenic", icon: GlobeAltIcon, classes: "bg-white/90 text-orange-600" },
  "wine-cellar": { label: "Popular", icon: StarIcon, classes: "bg-white/90 text-[#2c6e9b]" },
  beach: { label: "Popular", icon: StarIcon, classes: "bg-white/90 text-[#2c6e9b]" },
  market: { label: "Popular", icon: StarIcon, classes: "bg-white/90 text-[#2c6e9b]" },
};

export function getAttractionBadge(category?: string) {
  if (!category) return undefined;
  return BADGE_BY_CATEGORY[category];
}
