const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.gowithporto.pt";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@gowithporto.pt";

export const colors = {
  navy: "#1B2A4A",
  gold: "#C9A063",
  bg: "#FAF8F5",
  card: "#FFFFFF",
  border: "#E8E4DC",
  muted: "#6B7280",
  lightBlue: "#EEF2FB",
};

export const logoUrl = `${BASE_URL}/logo-email.png`;
export const shopUrl = `${BASE_URL}/shop`;
export const ordersUrl = `${BASE_URL}/dashboard/orders`;
export const adminDisputesUrl = `${BASE_URL}/admin/disputes`;
export const aiUrl = `${BASE_URL}/ai`;
export const googleReviewUrl = process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL || "";

/** Small secondary link prompting a Google review, for emails sent after the customer has actually received value (shipped order, delivered credits). Renders nothing if the review link isn't configured yet. */
export function reviewPrompt() {
  if (!googleReviewUrl) return "";
  return `
    <tr>
      <td align="center" style="padding-top:16px;">
        <a href="${googleReviewUrl}" style="color:${colors.muted};font-size:13px;text-decoration:underline;">Enjoying GoWithPorto? Leave us a review &rarr;</a>
      </td>
    </tr>`;
}

/** Bordered info card matching the order-confirmation meta bar, for 2-3 label/value columns. */
export function metaBar(cols: { label: string; value: string }[]) {
  const cells = cols
    .map(
      (col, i) => `
        <td style="padding:16px 20px;${i > 0 ? `border-left:1px solid ${colors.border};` : ""}" align="center">
          <div style="font-size:11px;color:${colors.muted};text-transform:uppercase;letter-spacing:0.03em;">${col.label}</div>
          <div style="font-size:14px;font-weight:bold;color:${colors.navy};margin-top:4px;">${col.value}</div>
        </td>`
    )
    .join("");

  return `
    <tr>
      <td style="background-color:${colors.bg};border:1px solid ${colors.border};border-radius:12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>${cells}</tr>
        </table>
      </td>
    </tr>`;
}

export function formatEUR(amount: number) {
  return `€${amount.toFixed(2)}`;
}

/** Wraps template-specific body HTML in the shared GoWithPorto header/footer chrome. */
export function baseLayout(bodyHtml: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background-color:${colors.bg};font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${colors.bg};padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td align="center" style="padding-bottom:20px;">
            <img src="${logoUrl}" alt="GoWithPorto" width="180" style="display:block;max-width:180px;height:auto;" />
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom:24px;">
            <span style="color:${colors.gold};font-size:18px;">&#10022;</span>
          </td>
        </tr>

        ${bodyHtml}

        <tr>
          <td align="center" style="padding-top:32px;">
            <span style="color:${colors.gold};font-size:18px;">&#10022;</span>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:20px 0 8px;font-family:Georgia,'Times New Roman',serif;color:${colors.navy};font-size:16px;font-weight:bold;">
            GOWITHPORTO
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom:16px;color:${colors.muted};font-size:13px;">
            Bringing the charm of Porto to you.
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom:8px;color:${colors.muted};font-size:13px;">
            Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color:${colors.navy};">${SUPPORT_EMAIL}</a>
          </td>
        </tr>
        <tr>
          <td align="center" style="color:#9CA3AF;font-size:12px;padding-top:4px;">
            &copy; ${new Date().getFullYear()} GoWithPorto. All rights reserved.<br/>
            Porto, Portugal
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

export function button(label: string, href: string) {
  return `<a href="${href}" style="display:inline-block;background-color:${colors.navy};color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;padding:12px 28px;border-radius:8px;">${label}</a>`;
}
