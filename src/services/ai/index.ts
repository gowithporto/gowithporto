import { AIIncompleteItineraryError } from "./aiProvider";
import { GroqProvider } from "./groqProvider";
import { buildTravelPrompt } from "./promptBuilder";
import { parseAIResponse } from "./responseParser";

const provider = new GroqProvider(process.env.GROQ_API_KEY!);

function dayCount(parsed: any): number {
  return Array.isArray(parsed?.itinerary) ? parsed.itinerary.length : 0;
}

export async function generateAIResponse({
  systemPrompt,
  userInput,
}: {
  systemPrompt: string;
  userInput: Record<string, any>;
}) {
  const requestedDays = Number(userInput.days) || 1;

  const prompt = buildTravelPrompt(systemPrompt, userInput);
  const result = await provider.generate({ prompt, userInput });
  let parsed = parseAIResponse(result.rawText);

  if (dayCount(parsed) !== requestedDays) {
    const gotFirstTry = dayCount(parsed);
    console.warn(
      `AI itinerary day mismatch: requested ${requestedDays}, got ${gotFirstTry}. Retrying once.`
    );

    const retryPrompt = buildTravelPrompt(systemPrompt, userInput, {
      retryAfterCount: gotFirstTry,
    });
    const retryResult = await provider.generate({ prompt: retryPrompt, userInput });
    parsed = parseAIResponse(retryResult.rawText);

    if (dayCount(parsed) !== requestedDays) {
      throw new AIIncompleteItineraryError(
        `Requested ${requestedDays} days, got ${dayCount(parsed)} after retry`
      );
    }
  }

  return parsed;
}
