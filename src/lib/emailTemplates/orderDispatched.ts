import { baseLayout, button, colors, metaBar, ordersUrl } from "./shared";

export interface OrderDispatchedData {
  recipientName: string;
  orderNumber: string;
  itemTitle: string;
  etaText: string;
}

export function orderDispatchedSubject(data: OrderDispatchedData) {
  return `Your GoWithPorto order ${data.orderNumber} is on its way`;
}

export function orderDispatchedHtml(data: OrderDispatchedData) {
  const body = `
    <tr>
      <td align="center" style="font-family:Georgia,'Times New Roman',serif;color:${colors.navy};font-size:28px;padding-bottom:16px;">
        Your Order Is On Its Way!
      </td>
    </tr>
    <tr>
      <td align="center" style="color:${colors.muted};font-size:14px;line-height:22px;padding-bottom:24px;">
        Hello <span style="color:${colors.gold};font-weight:bold;">${data.recipientName}</span>,<br/>
        <strong>${data.itemTitle}</strong> from your order has been dispatched.
      </td>
    </tr>
    ${metaBar([
      { label: "Order Number", value: data.orderNumber },
      { label: "Estimated Arrival", value: data.etaText },
      { label: "Status", value: "Dispatched" },
    ])}
    <tr><td style="height:24px;"></td></tr>
    <tr>
      <td align="center" style="color:${colors.muted};font-size:13px;line-height:20px;padding:0 20px 24px;">
        When it arrives, you'll be asked to show a confirmation code from your account —
        please only do this once you have the item in hand.
      </td>
    </tr>
    <tr>
      <td align="center">
        ${button("View My Order", ordersUrl)}
      </td>
    </tr>
  `;
  return baseLayout(body);
}
