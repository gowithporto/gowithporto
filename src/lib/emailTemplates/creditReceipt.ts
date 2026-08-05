import { baseLayout, colors, formatEUR } from "./shared";

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
      <td align="center" style="font-family:Georgia,'Times New Roman',serif;color:${colors.navy};font-size:26px;padding-bottom:16px;">
        Credits Added to Your Account
      </td>
    </tr>
    <tr>
      <td align="center" style="color:${colors.muted};font-size:14px;line-height:22px;padding-bottom:24px;">
        Hello <span style="color:${colors.gold};font-weight:bold;">${data.recipientName}</span>,<br/>
        Thanks for your purchase — your AI itinerary credits are ready to use.
      </td>
    </tr>
    <tr>
      <td style="background-color:${colors.bg};border:1px solid ${colors.border};border-radius:12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:16px 20px;" align="center">
              <div style="font-size:11px;color:${colors.muted};text-transform:uppercase;letter-spacing:0.03em;">Credits Added</div>
              <div style="font-size:14px;font-weight:bold;color:${colors.navy};margin-top:4px;">+${data.creditsAdded}</div>
            </td>
            <td style="padding:16px 20px;border-left:1px solid ${colors.border};" align="center">
              <div style="font-size:11px;color:${colors.muted};text-transform:uppercase;letter-spacing:0.03em;">Amount Paid</div>
              <div style="font-size:14px;font-weight:bold;color:${colors.navy};margin-top:4px;">${formatEUR(data.amount)}</div>
            </td>
            <td style="padding:16px 20px;border-left:1px solid ${colors.border};" align="center">
              <div style="font-size:11px;color:${colors.muted};text-transform:uppercase;letter-spacing:0.03em;">Date</div>
              <div style="font-size:14px;font-weight:bold;color:${colors.navy};margin-top:4px;">${data.date}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
  return baseLayout(body);
}
