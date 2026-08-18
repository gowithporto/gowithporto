import Groq, { InternalServerError, RateLimitError } from "groq-sdk";

import { AIInput, AIOutput, AIProvider, AIRateLimitError } from "./aiProvider";

// The only Groq-hosted model with `strict: true` structured outputs —
// constrained decoding that guarantees the response matches ITINERARY_SCHEMA
// exactly, instead of just hoping the model followed a JSON instruction in
// the prompt. See https://console.groq.com/docs/structured-outputs
const MODEL_NAME = "openai/gpt-oss-120b";

const ITINERARY_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    itinerary: {
      type: "array",
      items: {
        type: "object",
        properties: {
          day: { type: "integer" },
          title: { type: "string" },
          activities: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["day", "title", "activities"],
        additionalProperties: false,
      },
    },
  },
  required: ["summary", "itinerary"],
  additionalProperties: false,
};

// Free-tier quota is a hard 6,000 tokens/minute shared across the whole app —
// this retry only smooths over small real bursts; it can't absorb a real
// traffic spike on the free tier. That needs the Developer tier (add a card
// in the Groq console — same API key, no code change) with a spend limit set.
const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 2000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isTransientError(err: unknown): boolean {
  return err instanceof RateLimitError || err instanceof InternalServerError;
}

export class GroqProvider implements AIProvider {
  private client: Groq;

  constructor(apiKey: string) {
    this.client = new Groq({ apiKey });
  }

  async generate(input: AIInput): Promise<AIOutput> {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const completion = await this.client.chat.completions.create({
          model: MODEL_NAME,
          messages: [{ role: "user", content: input.prompt }],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "porto_itinerary",
              strict: true,
              schema: ITINERARY_SCHEMA,
            },
          },
        });

        return {
          rawText: completion.choices[0]?.message?.content ?? "",
        };
      } catch (err) {
        if (isTransientError(err)) {
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
