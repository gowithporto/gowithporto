import { baseLayout, button, colors, shopUrl } from "./shared";

export interface WelcomeData {
  recipientName: string;
}

export function welcomeSubject() {
  return `Welcome to GoWithPorto`;
}

export function welcomeHtml(data: WelcomeData) {
  const body = `
    <tr>
      <td align="center" style="font-family:Georgia,'Times New Roman',serif;color:${colors.navy};font-size:26px;padding-bottom:16px;">
        Welcome to GoWithPorto!
      </td>
    </tr>
    <tr>
      <td align="center" style="color:${colors.muted};font-size:14px;line-height:22px;padding-bottom:24px;">
        Hello <span style="color:${colors.gold};font-weight:bold;">${data.recipientName}</span>,<br/>
        Your account is ready. Browse authentic Porto souvenirs from local shops, or build a personalized AI itinerary for your trip.
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:8px 0 8px;">
        ${button("Explore the Shop", shopUrl)}
      </td>
    </tr>
  `;
  return baseLayout(body);
}
