import { baseLayout, button, colors, metaBar, ordersUrl } from "./shared";

export interface OrderReadyForPickupData {
  recipientName: string;
  orderNumber: string;
  itemTitle: string;
  etaText: string;
  storeName: string;
}

export function orderReadyForPickupSubject(data: OrderReadyForPickupData) {
  return `Your GoWithPorto order ${data.orderNumber} is ready for pickup`;
}

export function orderReadyForPickupHtml(data: OrderReadyForPickupData) {
  const body = `
    <tr>
      <td align="center" style="font-family:Georgia,'Times New Roman',serif;color:${colors.navy};font-size:28px;padding-bottom:16px;">
        Ready For Pickup!
      </td>
    </tr>
    <tr>
      <td align="center" style="color:${colors.muted};font-size:14px;line-height:22px;padding-bottom:24px;">
        Hello <span style="color:${colors.gold};font-weight:bold;">${data.recipientName}</span>,<br/>
        <strong>${data.itemTitle}</strong> is ready for you to collect at <strong>${data.storeName}</strong>.
      </td>
    </tr>
    ${metaBar([
      { label: "Order Number", value: data.orderNumber },
      { label: "Ready Around", value: data.etaText },
      { label: "Status", value: "Ready for Pickup" },
    ])}
    <tr><td style="height:24px;"></td></tr>
    <tr>
      <td align="center" style="color:${colors.muted};font-size:13px;line-height:20px;padding:0 20px 24px;">
        When you collect it, you'll be asked to show a confirmation code from your account —
        please only do this once the item is in your hands.
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
