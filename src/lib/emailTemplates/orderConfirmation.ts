import { baseLayout, button, colors, formatEUR, ordersUrl, shopUrl } from "./shared";

export interface OrderConfirmationItem {
  title: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface OrderConfirmationData {
  recipientName: string;
  orderNumber: string;
  orderDate: string;
  paymentMethod?: string; // e.g. "Visa •••• 4242"
  items: OrderConfirmationItem[];
  total: number;
}

export function orderConfirmationSubject(data: OrderConfirmationData) {
  return `Your GoWithPorto order ${data.orderNumber} is confirmed`;
}

export function orderConfirmationHtml(data: OrderConfirmationData) {
  const itemsHtml = data.items
    .map(
      (item, i) => `
        <tr>
          <td style="padding:14px 0;border-bottom:${i === data.items.length - 1 ? "none" : `1px solid ${colors.border}`};" width="56">
            ${
              item.image
                ? `<img src="${item.image}" width="48" height="48" alt="${item.title}" style="display:block;border-radius:8px;object-fit:cover;" />`
                : ""
            }
          </td>
          <td style="padding:14px 0 14px 12px;border-bottom:${i === data.items.length - 1 ? "none" : `1px solid ${colors.border}`};">
            <div style="font-size:14px;font-weight:bold;color:${colors.navy};">${item.title}</div>
            <div style="font-size:12px;color:${colors.muted};">Qty: ${item.quantity}</div>
          </td>
          <td align="right" style="padding:14px 0;border-bottom:${i === data.items.length - 1 ? "none" : `1px solid ${colors.border}`};font-size:14px;font-weight:bold;color:${colors.navy};white-space:nowrap;">
            ${formatEUR(item.price * item.quantity)}
          </td>
        </tr>`
    )
    .join("");

  const metaCols = [
    { label: "Order Number", value: data.orderNumber },
    { label: "Order Date", value: data.orderDate },
    ...(data.paymentMethod ? [{ label: "Payment Method", value: data.paymentMethod }] : []),
  ];

  const metaHtml = metaCols
    .map(
      (col, i) => `
        <td style="padding:16px 20px;${i > 0 ? `border-left:1px solid ${colors.border};` : ""}" align="center">
          <div style="font-size:11px;color:${colors.muted};text-transform:uppercase;letter-spacing:0.03em;">${col.label}</div>
          <div style="font-size:14px;font-weight:bold;color:${colors.navy};margin-top:4px;">${col.value}</div>
        </td>`
    )
    .join("");

  const body = `
    <tr>
      <td align="center" style="font-family:Georgia,'Times New Roman',serif;color:${colors.navy};font-size:28px;padding-bottom:16px;">
        Thank You for Your Order!
      </td>
    </tr>
    <tr>
      <td align="center" style="color:${colors.muted};font-size:14px;line-height:22px;padding-bottom:24px;">
        Hello <span style="color:${colors.gold};font-weight:bold;">${data.recipientName}</span>,<br/>
        We've received your order and are getting it ready.<br/>
        You'll receive another email once your items have shipped.
      </td>
    </tr>
    <tr>
      <td style="background-color:${colors.bg};border:1px solid ${colors.border};border-radius:12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>${metaHtml}</tr>
        </table>
      </td>
    </tr>
    <tr><td style="height:24px;"></td></tr>
    <tr>
      <td style="background-color:${colors.card};border:1px solid ${colors.border};border-radius:12px;padding:24px;">
        <div style="font-family:Georgia,'Times New Roman',serif;color:${colors.navy};font-size:18px;font-weight:bold;padding-bottom:12px;">
          Order Summary
        </div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${itemsHtml}
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${colors.lightBlue};border-radius:8px;margin-top:12px;">
          <tr>
            <td style="padding:14px 16px;font-size:15px;font-weight:bold;color:${colors.navy};">Total Paid</td>
            <td align="right" style="padding:14px 16px;font-size:20px;font-weight:bold;color:${colors.navy};">${formatEUR(data.total)}</td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="height:24px;"></td></tr>
    <tr>
      <td align="center">
        ${button("View My Order", ordersUrl)}
        <div style="padding-top:12px;">
          <a href="${shopUrl}" style="color:${colors.navy};font-size:13px;text-decoration:underline;">Visit Our Store &rarr;</a>
        </div>
      </td>
    </tr>
  `;

  return baseLayout(body);
}
