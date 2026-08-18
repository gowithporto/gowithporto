import { GroqProvider } from "./groqProvider";
import { buildTravelPrompt } from "./promptBuilder";
import { parseAIResponse } from "./responseParser";

const provider = new GroqProvider(process.env.GROQ_API_KEY!);

export async function generateAIResponse({
  systemPrompt,
  userInput,
}: {
  systemPrompt: string;
  userInput: Record<string, any>;
}) {
  const prompt = buildTravelPrompt(systemPrompt, userInput);

  const result = await provider.generate({
    prompt,
    userInput,
  });

  return parseAIResponse(result.rawText);
}
