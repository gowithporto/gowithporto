import { baseLayout, button, colors, metaBar, ordersUrl } from "./shared";

export interface DisputeResolvedData {
  recipientName: string;
  orderNumber: string;
  itemTitle: string;
  outcome: "seller_fault" | "buyer_fault" | "split";
  buyerRefundAmount: number;
}

export function disputeResolvedSubject(data: DisputeResolvedData) {
  return `Update on your GoWithPorto order ${data.orderNumber}`;
}

export function disputeResolvedHtml(data: DisputeResolvedData) {
  const outcomeText =
    data.outcome === "seller_fault"
      ? "We've reviewed the reported issue and refunded you in full."
      : data.outcome === "buyer_fault"
        ? "We've reviewed the reported issue and confirmed the order as completed."
        : "We've reviewed the reported issue and issued a partial refund.";

  const body = `
    <tr>
      <td align="center" style="font-family:Georgia,'Times New Roman',serif;color:${colors.navy};font-size:28px;padding-bottom:16px;">
        Order Update
      </td>
    </tr>
    <tr>
      <td align="center" style="color:${colors.muted};font-size:14px;line-height:22px;padding-bottom:24px;">
        Hello <span style="color:${colors.gold};font-weight:bold;">${data.recipientName}</span>,<br/>
        ${outcomeText}
      </td>
    </tr>
    ${metaBar([
      { label: "Order Number", value: data.orderNumber },
      { label: "Item", value: data.itemTitle },
      ...(data.buyerRefundAmount > 0
        ? [{ label: "Refunded", value: `€${data.buyerRefundAmount.toFixed(2)}` }]
        : []),
    ])}
    <tr><td style="height:24px;"></td></tr>
    <tr>
      <td align="center">
        ${button("View My Order", ordersUrl)}
      </td>
    </tr>
  `;
  return baseLayout(body);
}
