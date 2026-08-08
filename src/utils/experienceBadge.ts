import {
  BeakerIcon,
  BuildingLibraryIcon,
  MapIcon,
  MusicalNoteIcon,
  SparklesIcon,
  StarIcon,
} from "@heroicons/react/24/solid";

export const EXPERIENCE_CATEGORY_OPTIONS = [
  { value: "food-drinks", label: "Food & Drinks" },
  { value: "culture-history", label: "Culture & History" },
  { value: "outdoor-adventure", label: "Outdoor & Adventure" },
  { value: "crafts-workshops", label: "Crafts & Workshops" },
  { value: "music-fado", label: "Music & Fado" },
];

export const DURATION_OPTIONS = [
  { value: "up-to-2h", label: "Up to 2 hours" },
  { value: "2-4h", label: "2 – 4 hours" },
  { value: "half-day", label: "Half Day" },
  { value: "full-day", label: "Full Day" },
];

const ICON_BY_CATEGORY: Record<string, any> = {
  "food-drinks": BeakerIcon,
  "culture-history": BuildingLibraryIcon,
  "outdoor-adventure": MapIcon,
  "crafts-workshops": SparklesIcon,
  "music-fado": MusicalNoteIcon,
};

export function getExperienceCategoryIcon(category?: string) {
  if (!category) return StarIcon;
  return ICON_BY_CATEGORY[category] || StarIcon;
}

export function formatExperienceLabel(value: string) {
  const preset = EXPERIENCE_CATEGORY_OPTIONS.find((c) => c.value === value);
  if (preset) return preset.label;
  return value.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
