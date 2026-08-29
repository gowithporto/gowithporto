import { baseLayout, colors, metaBar } from "./shared";

export interface AdminPayoutData {
  payoutId: string;
  amount: number;
  currency: string;
  status: "paid" | "failed";
  arrivalDate: string;
  failureMessage?: string;
}

export function adminPayoutSubject(data: AdminPayoutData) {
  const amount = `${data.amount.toFixed(2)} ${data.currency.toUpperCase()}`;
  return data.status === "paid"
    ? `[GoWithPorto] Payout sent to your bank — ${amount}`
    : `[GoWithPorto] Payout FAILED — ${amount}`;
}

export function adminPayoutHtml(data: AdminPayoutData) {
  const amount = `${data.amount.toFixed(2)} ${data.currency.toUpperCase()}`;
  const heading =
    data.status === "paid" ? "Payout Sent To Your Bank" : "Payout Failed";

  const body = `
    <tr>
      <td align="center" style="font-family:Georgia,'Times New Roman',serif;color:${colors.navy};font-size:24px;padding-bottom:16px;">
        ${heading}
      </td>
    </tr>
    ${metaBar([
      { label: "Amount", value: amount },
      { label: "Status", value: data.status === "paid" ? "Paid" : "Failed" },
      { label: data.status === "paid" ? "Arrival" : "Attempted", value: data.arrivalDate },
    ])}
    ${
      data.failureMessage
        ? `<tr><td style="height:20px;"></td></tr>
    <tr>
      <td style="background-color:${colors.card};border:1px solid ${colors.border};border-radius:12px;padding:20px;color:${colors.navy};font-size:14px;line-height:22px;">
        <strong>Reason:</strong> ${data.failureMessage}
      </td>
    </tr>`
        : ""
    }
    <tr><td style="height:12px;"></td></tr>
    <tr>
      <td align="center" style="color:${colors.muted};font-size:12px;">
        Payout ID: ${data.payoutId}
      </td>
    </tr>
  `;
  return baseLayout(body);
}
