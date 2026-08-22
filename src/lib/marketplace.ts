export function isShopEnabled(): boolean {
  return process.env.NEXT_PUBLIC_SHOP_ENABLED === "true";
}
