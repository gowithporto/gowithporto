import { baseLayout, button, colors, metaBar, ordersUrl, reviewPrompt } from "./shared";

export interface OrderShippedData {
  recipientName: string;
  orderNumber: string;
  shippedDate: string;
}

export function orderShippedSubject(data: OrderShippedData) {
  return `Your GoWithPorto order ${data.orderNumber} has shipped`;
}

export function orderShippedHtml(data: OrderShippedData) {
  const body = `
    <tr>
      <td align="center" style="font-family:Georgia,'Times New Roman',serif;color:${colors.navy};font-size:28px;padding-bottom:16px;">
        Your Order Is On Its Way!
      </td>
    </tr>
    <tr>
      <td align="center" style="color:${colors.muted};font-size:14px;line-height:22px;padding-bottom:24px;">
        Hello <span style="color:${colors.gold};font-weight:bold;">${data.recipientName}</span>,<br/>
        Great news — your order has shipped and is on its way to you.
      </td>
    </tr>
    ${metaBar([
      { label: "Order Number", value: data.orderNumber },
      { label: "Shipped On", value: data.shippedDate },
      { label: "Status", value: "Shipped" },
    ])}
    <tr><td style="height:24px;"></td></tr>
    <tr>
      <td align="center">
        ${button("Track My Order", ordersUrl)}
      </td>
    </tr>
    ${reviewPrompt()}
  `;
  return baseLayout(body);
}
