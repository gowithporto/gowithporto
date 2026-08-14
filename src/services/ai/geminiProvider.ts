import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIInput, AIOutput, AIProvider, AIRateLimitError } from "./aiProvider";

// Pinned to a specific version rather than "gemini-flash-latest" so the model (and its
// quota/pricing behavior) can't shift under us silently — check
// https://ai.google.dev/gemini-api/docs/models for newer versions before bumping this.
const MODEL_NAME = "gemini-3.7-flash";

// Free-tier quota is a hard 5 requests/minute with no queueing — Gemini just rejects
// anything past that instantly. This retry only smooths over small real bursts (a
// couple of users generating at once); it can't absorb a real traffic spike on the
// free tier — that needs billing enabled on the Google Cloud project.
const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 2000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isRateLimitError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return message.includes("429") || message.includes("Too Many Requests");
}

export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async generate(input: AIInput): Promise<AIOutput> {
    const model = this.client.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: { responseMimeType: "application/json" },
    });

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await model.generateContent(input.prompt);
        const response = await result.response;

        return {
          rawText: response.text(),
        };
      } catch (err) {
        if (isRateLimitError(err)) {
          if (attempt < MAX_RETRIES) {
            await sleep(RETRY_DELAY_MS);
            continue;
          }
          throw new AIRateLimitError();
        }
        throw err;
      }
    }

    // Unreachable — the loop above always returns or throws.
    throw new AIRateLimitError();
  }
}
