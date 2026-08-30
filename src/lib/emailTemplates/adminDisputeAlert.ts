import { adminDisputesUrl, baseLayout, button, colors, metaBar } from "./shared";

export interface AdminDisputeAlertData {
  source: "buyer" | "handler" | "timeout";
  orderNumber: string;
  storeName: string;
  itemTitle: string;
  reasonLabel: string;
  note?: string;
}

export function adminDisputeAlertSubject(data: AdminDisputeAlertData) {
  return `[GoWithPorto] New dispute — ${data.itemTitle}`;
}

export function adminDisputeAlertHtml(data: AdminDisputeAlertData) {
  const sourceText =
    data.source === "buyer"
      ? "The buyer reported a problem with this item."
      : data.source === "handler"
        ? "The delivery/pickup handler reported a problem with this item."
        : "This item was dispatched and never confirmed within 24 hours.";

  const body = `
    <tr>
      <td align="center" style="font-family:Georgia,'Times New Roman',serif;color:${colors.navy};font-size:24px;padding-bottom:16px;">
        New Dispute
      </td>
    </tr>
    <tr>
      <td align="center" style="color:${colors.muted};font-size:14px;line-height:22px;padding-bottom:24px;">
        ${sourceText}
      </td>
    </tr>
    ${metaBar([
      { label: "Order", value: data.orderNumber },
      { label: "Store", value: data.storeName },
      { label: "Reason", value: data.reasonLabel },
    ])}
    ${
      data.note
        ? `<tr><td style="height:20px;"></td></tr>
    <tr>
      <td style="background-color:${colors.card};border:1px solid ${colors.border};border-radius:12px;padding:20px;color:${colors.navy};font-size:14px;line-height:22px;">
        <strong>Note:</strong> ${data.note}
      </td>
    </tr>`
        : ""
    }
    <tr><td style="height:24px;"></td></tr>
    <tr>
      <td align="center">
        ${button("Review in Admin", adminDisputesUrl)}
      </td>
    </tr>
  `;
  return baseLayout(body);
}
