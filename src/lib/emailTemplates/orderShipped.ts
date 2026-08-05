import { baseLayout, button, colors, ordersUrl } from "./shared";

export interface OrderShippedData {
  recipientName: string;
  orderNumber: string;
}

export function orderShippedSubject(data: OrderShippedData) {
  return `Your GoWithPorto order ${data.orderNumber} has shipped`;
}

export function orderShippedHtml(data: OrderShippedData) {
  const body = `
    <tr>
      <td align="center" style="font-family:Georgia,'Times New Roman',serif;color:${colors.navy};font-size:26px;padding-bottom:16px;">
        Your Order Is On Its Way!
      </td>
    </tr>
    <tr>
      <td align="center" style="color:${colors.muted};font-size:14px;line-height:22px;padding-bottom:24px;">
        Hello <span style="color:${colors.gold};font-weight:bold;">${data.recipientName}</span>,<br/>
        Great news — order <strong style="color:${colors.navy};">${data.orderNumber}</strong> has shipped and is on its way to you.
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:8px 0 8px;">
        ${button("Track My Order", ordersUrl)}
      </td>
    </tr>
  `;
  return baseLayout(body);
}
