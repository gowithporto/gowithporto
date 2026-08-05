import { aiUrl, baseLayout, button, colors, shopUrl } from "./shared";

export interface WelcomeData {
  recipientName: string;
}

export function welcomeSubject() {
  return `Welcome to GoWithPorto`;
}

export function welcomeHtml(data: WelcomeData) {
  const body = `
    <tr>
      <td align="center" style="font-family:Georgia,'Times New Roman',serif;color:${colors.navy};font-size:28px;padding-bottom:16px;">
        Welcome to GoWithPorto!
      </td>
    </tr>
    <tr>
      <td align="center" style="color:${colors.muted};font-size:14px;line-height:22px;padding-bottom:24px;">
        Hello <span style="color:${colors.gold};font-weight:bold;">${data.recipientName}</span>,<br/>
        Your account is ready. Here's what you can do next.
      </td>
    </tr>
    <tr>
      <td style="background-color:${colors.bg};border:1px solid ${colors.border};border-radius:12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:20px;" align="center">
              <div style="font-family:Georgia,'Times New Roman',serif;color:${colors.navy};font-size:15px;font-weight:bold;">Shop Souvenirs</div>
              <div style="font-size:13px;color:${colors.muted};margin-top:4px;">Authentic finds from local Porto shops</div>
            </td>
            <td style="padding:20px;border-left:1px solid ${colors.border};" align="center">
              <div style="font-family:Georgia,'Times New Roman',serif;color:${colors.navy};font-size:15px;font-weight:bold;">Plan with AI</div>
              <div style="font-size:13px;color:${colors.muted};margin-top:4px;">A personalized itinerary for your trip</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="height:24px;"></td></tr>
    <tr>
      <td align="center">
        ${button("Explore the Shop", shopUrl)}
        <div style="padding-top:12px;">
          <a href="${aiUrl}" style="color:${colors.navy};font-size:13px;text-decoration:underline;">Plan My Trip with AI &rarr;</a>
        </div>
      </td>
    </tr>
  `;
  return baseLayout(body);
}
