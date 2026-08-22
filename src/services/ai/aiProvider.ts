export interface AIInput {
  prompt: string;
  userInput: Record<string, any>;
}

export interface AIOutput {
  rawText: string;
  structured?: any;
}

export interface AIProvider {
  generate(input: AIInput): Promise<AIOutput>;
}

// Thrown when the underlying provider rejects a request for being over its rate limit,
// so callers (e.g. the API route) can show a "try again in a moment" message instead of
// a generic error.
export class AIRateLimitError extends Error {
  constructor(message = "AI provider rate limit exceeded") {
    super(message);
    this.name = "AIRateLimitError";
  }
}

// Thrown when the model returns fewer (or more) day entries than requested, even after
// a retry with a stricter prompt — callers must not charge the user's credit/free-use
// for an incomplete itinerary.
export class AIIncompleteItineraryError extends Error {
  constructor(message = "AI itinerary did not match the requested number of days") {
    super(message);
    this.name = "AIIncompleteItineraryError";
  }
}
