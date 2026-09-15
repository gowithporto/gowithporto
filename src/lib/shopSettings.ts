import { connectDB } from "@/lib/mongodb";
import GlobalConfig from "@/models/GlobalConfig";

export const SHOP_MIN_ORDER_CENTS_DEFAULT = 0; // 0 = no minimum enforced

export async function getShopMinOrderCents(): Promise<number> {
  await connectDB();
  const config = await GlobalConfig.findOne({ key: "SHOP_MIN_ORDER" });
  return config?.value?.minOrderCents ?? SHOP_MIN_ORDER_CENTS_DEFAULT;
}
