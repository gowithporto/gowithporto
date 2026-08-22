export function buildTravelPrompt(
  systemPrompt: string,
  userInput: Record<string, any>,
  options?: { retryAfterCount?: number }
) {
  const travelStyles: string[] = Array.isArray(userInput.travelStyles)
    ? userInput.travelStyles
    : [];
  const interests: string = (userInput.interests || "").trim();

  const preferenceLines = [
    `- Duration: ${userInput.days} days`,
    `- Budget Level: ${userInput.budget}`,
    `- Travel Group: ${userInput.people}`,
    userInput.dates ? `- Travel Dates: ${userInput.dates}` : null,
    travelStyles.length
      ? `- Preferred Travel Styles: ${travelStyles.join(", ")}`
      : null,
    interests ? `- Specific Interests (in the traveler's own words): ${interests}` : null,
  ].filter(Boolean);

  const days = Number(userInput.days) || 1;

  const retryWarning = options?.retryAfterCount
    ? `\nIMPORTANT: your previous attempt only produced ${options.retryAfterCount} of the ${days} required days. ` +
      `This is a retry — you MUST include all ${days} days this time, with no exceptions.\n`
    : "";

  return `
${systemPrompt}

User preferences for this Porto trip:
${preferenceLines.join("\n")}

Design the itinerary so every day visibly reflects the preferred travel styles and stated
interests above, not a generic Porto tour. Match the pace and price point of activities to
the budget level and travel group (e.g. a "Cheap" budget should lean on free/low-cost local
spots, a "Luxury" budget should include upscale or exclusive experiences; a "Family" group
should avoid late-night or adults-only activities). Each day should read as a realistic,
walkable sequence — do not repeat the same place across different days.

CRITICAL: the "itinerary" array MUST contain EXACTLY ${days} entries — one for each day of
the trip, numbered 1 through ${days} in order, with no days skipped, merged, or omitted.
A trip of ${days} days is incomplete with anything less than ${days} day entries. This is a
hard requirement, not a suggestion.
${retryWarning}
CRITICAL: You must respond ONLY with a valid JSON object. Do not include any markdown formatting or extra text.
The JSON must follow this structure:
{
  "summary": "Short overview of the trip, written for the traveler",
  "itinerary": [
    {
      "day": 1,
      "title": "A short, specific theme for the day (e.g. 'Riverside History & Port Wine Cellars'), not a generic label",
      "activities": ["3 to 5 concrete activities, each naming a real Porto place or experience"]
    },
    ...
    // continue through day ${days} — the array must have ${days} entries total
  ]
}
`;
}
