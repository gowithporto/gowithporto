import { connectDB } from "@/lib/mongodb";
import GlobalConfig from "@/models/GlobalConfig";

export const AI_CREDITS_PRICE_CENTS = 500; // €5 — fallback if no admin price is set
export const AI_CREDITS_PER_PURCHASE = 5; // fallback if no admin credit count is set

export async function getAiCreditsPricing(): Promise<{
  priceCents: number;
  creditsPerPurchase: number;
}> {
  await connectDB();
  const config = await GlobalConfig.findOne({ key: "CREDIT_PRICING" });
  return {
    priceCents: config?.value?.priceCents ?? AI_CREDITS_PRICE_CENTS,
    creditsPerPurchase: config?.value?.creditsPerPurchase ?? AI_CREDITS_PER_PURCHASE,
  };
}
