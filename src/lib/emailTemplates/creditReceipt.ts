import { aiUrl, baseLayout, button, colors, formatEUR, metaBar, reviewPrompt } from "./shared";

export interface CreditReceiptData {
  recipientName: string;
  creditsAdded: number;
  amount: number;
  currency: string;
  date: string;
}

export function creditReceiptSubject() {
  return `Your GoWithPorto AI credit purchase receipt`;
}

export function creditReceiptHtml(data: CreditReceiptData) {
  const body = `
    <tr>
      <td align="center" style="font-family:Georgia,'Times New Roman',serif;color:${colors.navy};font-size:28px;padding-bottom:16px;">
        Credits Added to Your Account
      </td>
    </tr>
    <tr>
      <td align="center" style="color:${colors.muted};font-size:14px;line-height:22px;padding-bottom:24px;">
        Hello <span style="color:${colors.gold};font-weight:bold;">${data.recipientName}</span>,<br/>
        Thanks for your purchase — your AI itinerary credits are ready to use.
      </td>
    </tr>
    ${metaBar([
      { label: "Credits Added", value: `+${data.creditsAdded}` },
      { label: "Amount Paid", value: formatEUR(data.amount) },
      { label: "Date", value: data.date },
    ])}
    <tr><td style="height:24px;"></td></tr>
    <tr>
      <td align="center">
        ${button("Start Planning", aiUrl)}
      </td>
    </tr>
    ${reviewPrompt()}
  `;
  return baseLayout(body);
}
