import Product from "@/models/Product";

type OrderItem = {
  productId?: any;
  variantId?: string;
  quantity: number;
};

export async function decrementStockForOrder(items: OrderItem[]) {
  for (const item of items) {
    if (!item.productId || !item.quantity) continue;

    if (item.variantId) {
      await Product.updateOne(
        { _id: item.productId, "variants._id": item.variantId },
        { $inc: { "variants.$.quantity": -item.quantity } },
      );
    } else {
      await Product.updateOne(
        { _id: item.productId },
        { $inc: { quantity: -item.quantity } },
      );
    }
  }
}
