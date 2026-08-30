import { baseLayout, colors, metaBar } from "./shared";

export interface NewOrderForStoreOwnerData {
  storeName: string;
  orderNumber: string;
  deliveryType: "pickup" | "delivery";
  items: { title: string; quantity: number; price: number }[];
  total: number;
}

export function newOrderForStoreOwnerSubject(data: NewOrderForStoreOwnerData) {
  return `[GoWithPorto] New order — ${data.orderNumber}`;
}

export function newOrderForStoreOwnerHtml(data: NewOrderForStoreOwnerData) {
  const itemRows = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding:8px 0;color:${colors.navy};font-size:14px;">${item.title} × ${item.quantity}</td>
      <td style="padding:8px 0;color:${colors.navy};font-size:14px;text-align:right;">€${(item.price * item.quantity).toFixed(2)}</td>
    </tr>`
    )
    .join("");

  const body = `
    <tr>
      <td align="center" style="font-family:Georgia,'Times New Roman',serif;color:${colors.navy};font-size:24px;padding-bottom:16px;">
        New Order — ${data.storeName}
      </td>
    </tr>
    ${metaBar([
      { label: "Order", value: data.orderNumber },
      { label: "Fulfillment", value: data.deliveryType === "pickup" ? "Pickup" : "Delivery" },
      { label: "Total", value: `€${data.total.toFixed(2)}` },
    ])}
    <tr><td style="height:20px;"></td></tr>
    <tr>
      <td>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${itemRows}
        </table>
      </td>
    </tr>
    <tr><td style="height:12px;"></td></tr>
    <tr>
      <td align="center" style="color:${colors.muted};font-size:13px;">
        Log in to your store dashboard to dispatch this order.
      </td>
    </tr>
  `;
  return baseLayout(body);
}
